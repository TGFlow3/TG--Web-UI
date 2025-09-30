// Container animation functionality - Container 1 click to slide out Container 2
const container1 = document.querySelector('.info-container:first-child');
const container2 = document.getElementById('container2');
const body = document.body;

// Hide container 2 initially
container2.classList.add('hidden');

// Add click event to container 1 to toggle container 2 and adjust positions
container1.addEventListener('click', function(e) {
    // Prevent container toggle if clicking on chat elements
    if (e.target.closest('#chat-container') || 
        e.target.closest('#chat-input') || 
        e.target.closest('#send-btn') || 
        e.target.closest('#clear-chat-btn') ||
        e.target.closest('.chat-message') ||
        e.target.id === 'chat-input' ||
        e.target.id === 'send-btn' ||
        e.target.id === 'clear-chat-btn') {
        return; // Don't toggle containers if clicking on chat elements
    }
    
    container2.classList.toggle('hidden');
    body.classList.toggle('containers-expanded');
});

// ===== OLLAMA CHAT SYSTEM =====

// Chat conversation history
let chatHistory = [];

// Send message to Ollama API
async function sendMessageToOllama(message) {
    // Add "assistant is typing" indicator
    chatHistory.push({ role: 'assistant', content: 'Flow is typing...', isTyping: true });
    updateChatMessages();
    
    try {
        const response = await fetch('http://localhost:5000/rag_query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: message
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Remove typing indicator
        chatHistory = chatHistory.filter(msg => !msg.isTyping);
        
        // Add Ollama response with filenames
        chatHistory.push({ 
            role: 'assistant', 
            content: data.response || 'No response from Ollama',
            filenames: data.filenames || []
        });
        
        updateChatMessages();
        scrollToBottom();
        
        // Display referenced files in Container 2
        if (data.filenames && data.filenames.length > 0) {
            displayReferencedFiles(data.filenames);
            showContainer2();
        }
        
    } catch (error) {
        console.error('Ollama API Error:', error);
        
        // Remove typing indicator and show error
        chatHistory = chatHistory.filter(msg => !msg.isTyping);
        chatHistory.push({ 
            role: 'assistant', 
            content: `Error: ${error.message}. Make sure Ollama is running on localhost:11434`,
            isError: true
        });
        
        updateChatMessages();
    }
}

// Update chat messages in the existing HTML
function updateChatMessages() {
    const chatMessagesDiv = document.getElementById('chat-messages');
    if (!chatMessagesDiv) return;

    if (chatHistory.length === 0) {
        chatMessagesDiv.innerHTML = `
            <div class="chat-welcome-message">
                <p class="welcome-title">👋 Start a conversation!</p>
                <p class="welcome-subtitle">Type your message in the input below and press Enter</p>
            </div>`;
        return;
    }

    chatMessagesDiv.innerHTML = chatHistory.map((msg) => {
        const isUser = msg.role === 'user';
        const isTyping = msg.isTyping;
        const isError = msg.isError;
        
        const messageClass = isUser ? 'user-message' : 'assistant-message';
        const alignStyle = isUser ? 'margin-left: 40px; text-align: right;' : '';
        const errorStyle = isError ? 'color: #ff6b6b;' : '';
        
        return `
            <div style="${alignStyle}" class="chat-message ${messageClass}">
                <div style="${errorStyle}">
                    <div style="font-size: 11px; font-weight: 600; opacity: 0.7; margin-bottom: 4px;">
                        ${isUser ? 'You' : 'Flow'}
                    </div>
                    <div>
                        ${isTyping ? 
                            '<span>Flow is typing<span class="typing-indicator">...</span></span>' : 
                            escapeHtml(msg.content)
                        }
                    </div>
                </div>
            </div>`;
    }).join('');
    
    // Ensure input stays visible after updating messages
    ensureInputVisible();
}

// Simple function to ensure input stays visible
function ensureInputVisible() {
    setTimeout(() => {
        const inputContainer = document.getElementById('chat-input-container');
        const chatInput = document.getElementById('chat-input');
        
        if (inputContainer) {
            inputContainer.style.display = 'flex';
            inputContainer.style.height = '70px';
            inputContainer.style.flexShrink = '0';
        }
        
        if (chatInput) {
            chatInput.style.height = '40px';
            chatInput.style.backgroundColor = 'white';
            chatInput.style.color = 'black';
        }
        
        console.log('Input visibility ensured');
    }, 50);
}

// Setup chat input handlers with more robust element finding
function setupChatInputHandlers() {
    setTimeout(() => {
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        const clearBtn = document.getElementById('clear-chat-btn');
        
        console.log('Setting up handlers for:', {
            chatInput: !!chatInput,
            sendBtn: !!sendBtn,
            clearBtn: !!clearBtn
        });
        
        if (chatInput && sendBtn) {
            // Remove existing listeners to prevent duplicates
            const newChatInput = chatInput.cloneNode(true);
            const newSendBtn = sendBtn.cloneNode(true);
            
            chatInput.parentNode.replaceChild(newChatInput, chatInput);
            sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
            
            // Add fresh event listeners
            newChatInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendChatMessage();
                }
            });

            newSendBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                sendChatMessage();
            });

            // Focus styling
            newChatInput.addEventListener('focus', function() {
                this.style.borderColor = '#007acc';
                this.style.boxShadow = '0 2px 8px rgba(0,122,204,0.15)';
            });

            newChatInput.addEventListener('blur', function() {
                this.style.borderColor = '#ccc';
                this.style.boxShadow = 'none';
            });
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                clearChat();
            });
        }
    }, 50);
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
        
        // Update chat display
        updateChatMessages();
        scrollToBottom();
        
        // Send to Ollama
        sendMessageToOllama(message);
    }
}

// Auto-scroll to bottom of chat
function scrollToBottom() {
    setTimeout(() => {
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, 100);
}

// Clear chat history
function clearChat() {
    chatHistory = [];
    updateChatMessages();
    
    // Clear referenced files and hide Container 2
    clearReferencedFiles();
    hideContainer2();
    
    // Focus back on input
    const chatInput = document.getElementById('chat-input');
    if (chatInput) chatInput.focus();
}

// Setup all chat event listeners
function setupChatSystem() {
    console.log('Setting up chat system...');
    
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const clearBtn = document.getElementById('clear-chat-btn');
    
    if (!chatInput || !sendBtn) {
        console.log('Chat elements not found yet, retrying...');
        setTimeout(setupChatSystem, 100);
        return;
    }

    // Handle Enter key
    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });

    // Handle send button click  
    sendBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        sendChatMessage();
    });

    // Handle clear chat button
    if (clearBtn) {
        clearBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            clearChat();
        });
    }

    // Input focus styling
    chatInput.addEventListener('focus', function() {
        this.style.borderColor = '#007acc';
        this.style.boxShadow = '0 2px 8px rgba(0,122,204,0.15)';
    });

    chatInput.addEventListener('blur', function() {
        this.style.borderColor = '#ccc';
        this.style.boxShadow = 'none';
    });

    // Auto-focus the input
    setTimeout(() => {
        if (chatInput) {
            chatInput.focus();
            console.log('Chat input focused');
        }
    }, 200);

    console.log('Chat system initialized successfully!');
}

// Helper function to escape HTML and prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize chat system when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up chat system...');
    setupChatSystem();
    clearReferencedFiles(); // Initialize Container 2 content
});

// Also try to setup immediately in case DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading
} else {
    // DOM is already loaded
    setupChatSystem();
    clearReferencedFiles(); // Initialize Container 2 content
}

// Display referenced files in Container 2
function displayReferencedFiles(filenames) {
    const container2 = document.getElementById('container2');
    
    // First, restore the proper container structure if it was modified by file viewing
    if (!container2.querySelector('.container-content')) {
        container2.innerHTML = `
            <div class="container-header" style="
                padding: 20px 30px 10px 30px;
                border-bottom: 2px solid #444444;
                background-color: rgba(255, 255, 255, 0.1);
            ">
                <h2 style="margin: 0; color: #ffffff; font-size: 20px;">Referenced Files</h2>
            </div>
            <div class="container-content" style="
                padding: 20px 30px;
                overflow-y: auto;
                height: calc(100% - 80px);
            "></div>
        `;
    }
    
    const container2Content = document.querySelector('#container2 .container-content');
    
    if (container2Content) {
        // Clear existing content
        container2Content.innerHTML = '';
        
        // Create files display
        const filesHeader = document.createElement('div');
        filesHeader.style.cssText = `
            padding: 16px;
            border-bottom: 1px solid #444;
            background-color: rgba(255, 255, 255, 0.05);
        `;
        filesHeader.innerHTML = `
            <h3 style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                📄 Referenced Files (${filenames.length})
            </h3>
        `;
        
        const filesList = document.createElement('div');
        filesList.style.cssText = `
            padding: 16px;
            max-height: 350px;
            overflow-y: auto;
        `;
        
        // Remove duplicates and create file list
        const uniqueFilenames = [...new Set(filenames)];
        
        uniqueFilenames.forEach((filename, index) => {
            const shortName = filename.split('\\').pop() || filename.split('/').pop() || filename;
            
            const fileDiv = document.createElement('div');
            fileDiv.className = 'file-item';
            fileDiv.setAttribute('data-filepath', filename);
            fileDiv.style.cssText = `
                margin-bottom: 12px;
                padding: 12px;
                background-color: rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                border-left: 4px solid #007acc;
                transition: all 0.2s ease;
                cursor: pointer;
            `;
            
            fileDiv.innerHTML = `
                <div style="
                    font-weight: 600;
                    color: #ffffff;
                    margin-bottom: 4px;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                ">
                    📄 ${escapeHtml(shortName)}
                </div>
                <div style="
                    font-size: 12px;
                    color: #cccccc;
                    opacity: 0.8;
                    word-break: break-all;
                ">${escapeHtml(filename)}</div>
            `;
            
            // Add event listeners
            fileDiv.addEventListener('mouseover', function() {
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                this.style.transform = 'translateX(4px)';
            });
            
            fileDiv.addEventListener('mouseout', function() {
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                this.style.transform = 'translateX(0px)';
            });
            
            fileDiv.addEventListener('click', function() {
                console.log('File clicked:', filename);
                // File viewing functionality removed
            });
            
            filesList.appendChild(fileDiv);
        });
        
        container2Content.appendChild(filesHeader);
        container2Content.appendChild(filesList);
    }
}

// Show Container 2 automatically
function showContainer2() {
    if (container2.classList.contains('hidden')) {
        container2.classList.remove('hidden');
        body.classList.add('containers-expanded');
    }
}

// Hide Container 2
function hideContainer2() {
    container2.classList.add('hidden');
    body.classList.remove('containers-expanded');
}

// Clear referenced files display
function clearReferencedFiles() {
    const container2Content = document.querySelector('#container2 .container-content');
    if (container2Content) {
        container2Content.innerHTML = `
            <div style="
                padding: 40px 20px;
                text-align: center;
                color: #888888;
                font-style: italic;
            ">
                📁 No files referenced yet.<br>
                Files will appear here when the AI references them.
            </div>
        `;
    }
}







// File viewing functionality has been removed

// ===== END OLLAMA CHAT SYSTEM =====

// ===== AUTHENTICATION LOGIC =====

