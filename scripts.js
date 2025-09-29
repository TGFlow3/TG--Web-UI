document.addEventListener("DOMContentLoaded", () => {
    // Login logic for ACELogin.html
  const loginForm = document.querySelector('.login-form');
  console.log('loginForm:', loginForm);
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      console.log('loginForm submitted');
      e.preventDefault();
      const userID = document.getElementById('userID').value.trim();
      const errorDiv = document.getElementById('login-error');
      if (userID.length > 0) {
        errorDiv.style.display = 'none';
        localStorage.setItem('userID', userID); // Store user ID for Home page
        localStorage.setItem('sidebarAnimate', 'true');
        window.location.href = 'index.html';
      } else {
        errorDiv.textContent = 'UserID is required.';
        errorDiv.style.display = 'block';
      }
    });
  }

  // Show logged-in user ID next to user icon
  const userIcon = document.getElementById('userIcon');
  const storedUserId = localStorage.getItem('userID');
  if (userIcon && storedUserId) {
    let displaySpan = document.getElementById('userIdDisplay');
    if (!displaySpan) {
      displaySpan = document.createElement('span');
      displaySpan.id = 'userIdDisplay';
      displaySpan.style.marginLeft = '0.5em';
      displaySpan.style.fontWeight = 'bold';
      userIcon.parentNode.insertBefore(displaySpan, userIcon.nextSibling);
    }
    displaySpan.textContent = storedUserId;
  }

  // Dropdown menu logic for Home.html user icon
  const userDropdown = document.getElementById('userDropdown');
  const logoutMenuItem = document.getElementById('logoutMenuItem');
  console.log('userIcon:', userIcon, 'userDropdown:', userDropdown, 'logoutMenuItem:', logoutMenuItem);
  if (userIcon && userDropdown) {
      userIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        if (userDropdown.classList.contains('show')) {
          userDropdown.classList.remove('show');
          setTimeout(() => { userDropdown.style.display = 'none'; }, 250);
        } else {
          userDropdown.style.display = 'block';
          setTimeout(() => { userDropdown.classList.add('show'); }, 10);
        }
      });
      document.addEventListener('click', function(e) {
        if (userDropdown.classList.contains('show')) {
          userDropdown.classList.remove('show');
          setTimeout(() => { userDropdown.style.display = 'none'; }, 250);
        }
      });
      if (logoutMenuItem) {
        logoutMenuItem.addEventListener('click', function(e) {
          e.preventDefault();
          window.location.href = 'acelogin.html';
        });
      }
  }

  // Logout logic for index.html
  const logoutBtn = document.getElementById('logoutBtn');
  console.log('logoutBtn:', logoutBtn);
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      console.log('logoutBtn clicked');
      window.location.href = 'acelogin.html';
    });
  }

  // ===== CHAT MESSAGE LOGIC =====
  
  // Chat conversation history
  let chatHistory = [];

  // --- Chat Interface Setup ---
  const searchBar = document.getElementById('search-bar');
  
  // Hide the search bar container immediately since we're showing chat
  const searchBarContainer = document.getElementById('search-bar')?.parentElement;
  if (searchBarContainer) {
    searchBarContainer.style.display = 'none';
  }
  
  // Show chat interface immediately on page load
  const recentView = document.getElementById('recent-view');
  if (recentView) {
    recentView.style.display = 'block';
    renderChatInterface();
  }

  // Send message to Ollama API
  function sendMessageToOllama(message) {
    // Add "thinking" indicator
    chatHistory.push({ role: 'assistant', content: '...', isTyping: true });
    renderChatInterface();
    
    fetch('http://localhost:5000/rag_query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: message // Send the user's message as the query
      })
    })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return res.json();
    })
    .then(data => {
      chatHistory = chatHistory.filter(msg => !msg.isTyping);
      chatHistory.push({ 
        role: 'assistant', 
        content: data.response || 'No response from Ollama',
        filenames: data.filenames || []
      });
      renderChatInterface();
      
      // Update files pane
      const filesPane = document.getElementById('referenced-files');
      if (filesPane) {
        filesPane.innerHTML = renderReferencedFiles();
      }
      
      // Auto-scroll to bottom
      setTimeout(() => {
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    })
    .catch(err => {
      // Remove typing indicator and show error
      chatHistory = chatHistory.filter(msg => !msg.isTyping);
      chatHistory.push({ 
        role: 'assistant', 
        content: `Error: ${err.message}`,
        isError: true
      });
      renderChatInterface();
    });
  }

  // Build conversation prompt with context
  function buildConversationPrompt() {
    let prompt = "You are a helpful AI assistant. Please respond naturally to the conversation.\n\nConversation:\n";
    
    // Add conversation history (keep last 10 messages to avoid token limits)
    const recentHistory = chatHistory.filter(msg => !msg.isTyping).slice(-10);
    recentHistory.forEach(msg => {
      if (msg.role === 'user') {
        prompt += `Human: ${msg.content}\n`;
      } else {
        prompt += `Assistant: ${msg.content}\n`;
      }
    });
    
    prompt += "Assistant:";
    return prompt;
  }

  // Render chat interface
  function renderChatInterface() {
    const view = document.getElementById('recent-view');
    if (!view) return;

    view.innerHTML = `
      <div class="document-view-section">
        <div class="document-view-header">
          <h2>Chat with Flow</h2>
          <button id="clear-chat-btn">Clear Chat</button>
        </div>
        <div id="chat-container" style="display: flex; flex-direction: row; height: 600px; gap: 10px; width: 100%;">
          <div id="chat-pane" style="flex: 1; min-width: 0; display: flex; flex-direction: column; border: 1px solid #ddd; border-radius: 8px;">
            <div style="padding: 10px; background: #f5f5f5; border-bottom: 1px solid #ddd; border-radius: 8px 8px 0 0;">
              <strong>Chat Messages</strong>
            </div>
            <div id="chat-messages" style="flex: 1; overflow-y: auto; padding: 10px; height: 480px;">
              ${renderChatMessages()}
            </div>
            <div id="chat-input-container" style="padding: 10px; border-top: 1px solid #ddd;">
              <input 
                type="text" 
                id="chat-input" 
                placeholder="Type your message..." 
                style="width: calc(100% - 60px); padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
              />
              <button 
                id="send-btn"
                style="width: 50px; padding: 8px; margin-left: 5px; border: 1px solid #007acc; background: #007acc; color: white; border-radius: 4px; cursor: pointer;"
              >
                ➤
              </button>
            </div>
          </div>
          <div id="files-pane" style="flex: 0 0 300px; width: 300px; display: flex; flex-direction: column; border: 1px solid #ddd; border-radius: 8px;">
            <div style="padding: 10px; background: #f5f5f5; border-bottom: 1px solid #ddd; border-radius: 8px 8px 0 0;">
              <strong>Referenced Files</strong>
            </div>
            <div id="referenced-files" style="flex: 1; overflow-y: auto; padding: 10px; height: 540px;">
              ${renderReferencedFiles()}
            </div>
          </div>
        </div>
      </div>`;

    // Setup chat input handlers
    setupChatInputHandlers();

    // Add clear chat functionality
    const clearBtn = document.getElementById('clear-chat-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        chatHistory = [];
        renderChatInterface();
      });
    }

    // Ensure the document view section is visible
    const docSection = view.querySelector('.document-view-section');
    if (docSection && !docSection.classList.contains('visible')) {
      docSection.classList.add('visible');
    }

    // Auto-scroll to bottom after render
    setTimeout(() => {
      const chatMessages = document.getElementById('chat-messages');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }, 50);
  }

  // Render referenced files
  function renderReferencedFiles() {
    const assistantMessages = chatHistory.filter(msg => msg.role === 'assistant' && msg.filenames && msg.filenames.length > 0);
    
    if (assistantMessages.length === 0) {
      return '<div style="color: #666; font-style: italic;">No files referenced yet</div>';
    }

    return assistantMessages.map((msg, index) => {
      const uniqueFilenames = [...new Set(msg.filenames)]; // Remove duplicates
      return `
        <div style="margin-bottom: 15px; padding: 10px; background: #f9f9f9; border-radius: 5px; border-left: 3px solid #007acc;">
          <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Response #${assistantMessages.length - index}</div>
          <ul style="margin: 0; padding-left: 20px;">
            ${uniqueFilenames.map(filename => `<li style="margin: 2px 0;"><code style="background: #e8e8e8; padding: 2px 4px; border-radius: 3px; font-size: 11px;">${escapeHtml(filename)}</code></li>`).join('')}
          </ul>
        </div>`;
    }).reverse().join('');
  }

  // Render individual chat messages
  function renderChatMessages() {
    if (chatHistory.length === 0) {
      return `
        <div class="chat-welcome-message">
          <p class="welcome-title">👋 Start a conversation!</p>
          <p class="welcome-subtitle">Type your message in the input below and press Enter</p>
        </div>`;
    }

    return chatHistory.map((msg, index) => {
      const isUser = msg.role === 'user';
      const isTyping = msg.isTyping;
      const isError = msg.isError;
      
      const alignStyle = isUser ? 'margin-left: 40px; text-align: right;' : '';
      const bgColor = isUser ? '' : (isError ? '' : '');
      const textColor = '';
      const borderRadius = isUser ? '' : '';
      
      return `
        <div style="${alignStyle}" class="chat-message">
          <div>
            <div>
              ${isUser ? 'You' : 'Flow'}
            </div>
            <div>
              ${isTyping ? '<span>Flow is typing<span class="typing-dots">...</span></span>' : (isUser ? escapeHtml(msg.content) : msg.content)}
            </div>
          </div>
        </div>`;
    }).join('');
  }

  // Setup chat input handlers for the embedded input
  function setupChatInputHandlers() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    
    if (!chatInput || !sendBtn) return;

    // Handle Enter key
    chatInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });

    // Handle send button click
    sendBtn.addEventListener('click', sendChatMessage);

    // Focus on input and add styling effects
    chatInput.addEventListener('focus', function() {
      this.style.borderColor = '#007acc';
      this.style.background = '#ffffff';
      this.style.boxShadow = '0 2px 8px rgba(0,122,204,0.15)';
    });

    chatInput.addEventListener('blur', function() {
      this.style.borderColor = '#ddd';
      this.style.background = '#f8f9fa';
      this.style.boxShadow = 'none';
    });

    // Auto-focus the input
    setTimeout(() => chatInput.focus(), 100);
  }

  // Send chat message function
  function sendChatMessage() {
    const chatInput = document.getElementById('chat-input');
    if (!chatInput) return;

    const message = chatInput.value.trim();
    if (message.length > 0) {
      // Add user message to history
      chatHistory.push({ role: 'user', content: message });
      
      // Clear input
      chatInput.value = '';
      
      // Re-render chat with new message
      renderChatInterface();
      
      // Send to Ollama
      sendMessageToOllama(message);
    }
  }

  // Helper function to escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ===== END CHAT MESSAGE LOGIC =====

  


});