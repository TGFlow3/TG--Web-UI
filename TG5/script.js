// Container animation functionality - Container 1 click to slide out Container 2
const container1 = document.querySelector('.info-container:first-child');
const container2 = document.getElementById('container2');
const body = document.body;

// Hide container 2 initially (only if it exists)
if (container2) {
    container2.classList.add('hidden');
}

// Add click event to container 1 to toggle container 2 and adjust positions (only if both exist)
if (container1 && container2) {
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
        if (body) {
            body.classList.toggle('containers-expanded');
        }
    });
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
                fetch('http://localhost:5000/get_file_content', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename: shortName })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.content) {
                        // Use the existing file management system's display function
                        displayFileContentInContainer(shortName, data.content, [], "Referenced from AI chat");
                        
                        // Create a mock file object for the file management system
                        const mockFileData = {
                            name: shortName,
                            content: data.content,
                            size: data.content.length,
                            type: shortName.split('.').pop(),
                            isPdf: shortName.toLowerCase().endsWith('.pdf'),
                            lastModified: new Date()
                        };
                        
                        // Add to uploadedFiles if not already there (needed for tagging system)
                        const existingIndex = uploadedFiles.findIndex(f => f.name === shortName);
                        if (existingIndex === -1) {
                            uploadedFiles.push(mockFileData);
                        } else {
                            uploadedFiles[existingIndex] = mockFileData; // Update existing
                        }
                        
                        // Track as recent file for the file management system
                        trackRecentFile(mockFileData, "AI Referenced");
                        
                        // Persist state to include this file in saved data
                        persistState();
                    } else {
                        alert('Could not fetch file content.');
                    }
                })
                .catch(error => {
                    console.error('Error fetching file content:', error);
                    alert('Error fetching file content: ' + error.message);
                });
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
                query: message,                // <-- use 'query'
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
            content: `Error: ${error.message}. Make sure Ollama is running on localhost:5000`,
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

// Helper function to escape HTML and prevent XSS (enhanced version for Ollama)
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}







// ===== LOCAL FILE SEARCH SYSTEM =====

// Store uploaded files and their content
let uploadedFiles = [];

// Store recently viewed files
let recentFiles = [];
const MAX_RECENT_FILES = 10;

// Store all file tags
let fileTags = new Map(); // filename -> [tags array]

// Version control system
let fileVersions = new Map(); // filename -> array of versions
let modifiedFiles = new Set(); // files that have been edited

// localStorage persistence functions
function saveAppState() {
    try {
        // Get currently active sidebar section - only save if container2 is visible (meaning we're in a sidebar view)
        const activeSection = document.querySelector('.sidebar-item.active');
        const container2 = document.getElementById('container2');
        const isInSidebarView = container2 && !container2.classList.contains('hidden') && container2.style.display !== 'none';
        const activeSectionName = (activeSection && isInSidebarView) ? activeSection.getAttribute('data-section') : null;
        
        const appState = {
            uploadedFiles: uploadedFiles,
            recentFiles: recentFiles,
            fileTags: Array.from(fileTags.entries()),
            fileVersions: Array.from(fileVersions.entries()),
            modifiedFiles: Array.from(modifiedFiles),
            activeSection: activeSectionName
        };
        localStorage.setItem('fileManagerState', JSON.stringify(appState));
    } catch (error) {
        console.warn('Failed to save app state:', error);
    }
}

function loadAppState() {
    try {
        const savedState = localStorage.getItem('fileManagerState');
        if (savedState) {
            const appState = JSON.parse(savedState);
            
            // Restore arrays and data structures
            uploadedFiles = appState.uploadedFiles || [];
            
            // Restore recentFiles with proper Date objects
            recentFiles = (appState.recentFiles || []).map(file => ({
                ...file,
                viewedAt: new Date(file.viewedAt)
            }));
            
            fileTags = new Map(appState.fileTags || []);
            
            // Restore fileVersions with proper Date objects
            const restoredVersions = appState.fileVersions || [];
            fileVersions = new Map(restoredVersions.map(([fileName, versions]) => [
                fileName,
                versions.map(version => ({
                    ...version,
                    timestamp: new Date(version.timestamp)
                }))
            ]));
            
            modifiedFiles = new Set(appState.modifiedFiles || []);
            
            // Update displays and indicators
            updateRecentFilesDisplay();
            updateRecentIndicator();
            updateTagsIndicator();
            updateVersionControlIndicator();
            
            // Automatic tab restoration disabled
            // if (appState.activeSection) {
            //     const sectionElement = document.querySelector(`[data-section="${appState.activeSection}"]`);
            //     if (sectionElement) {
            //         // Simulate click to restore the view
            //         setTimeout(() => {
            //             sectionElement.click();
            //         }, 200);
            //     }
            // }
            
            console.log('App state restored from localStorage');
        }
    } catch (error) {
        console.warn('Failed to load app state:', error);
        // Initialize with empty state if loading fails
        uploadedFiles = [];
        recentFiles = [];
        fileTags = new Map();
        fileVersions = new Map();
        modifiedFiles = new Set();
    }
}

// Auto-save state whenever data changes
function persistState() {
    saveAppState();
}

// Track tagged files for sidebar indicator
function getTaggedFilesCount() {
    return Array.from(fileTags.values()).filter(tags => tags.length > 0).length;
}

// Get all files with tags for display
function getAllTaggedFiles() {
    const taggedFiles = [];
    
    // First, get all uploaded files that have tags
    uploadedFiles.forEach(file => {
        const tags = fileTags.get(file.name);
        if (tags && tags.length > 0) {
            taggedFiles.push({
                ...file,
                tags: tags
            });
        }
    });
    
    // Also check for any tagged files that might not be in uploadedFiles yet
    // This handles the case where a file was tagged but not properly added to uploadedFiles
    fileTags.forEach((tags, fileName) => {
        if (tags && tags.length > 0) {
            // Check if this file is already in our taggedFiles array
            const alreadyIncluded = taggedFiles.some(f => f.name === fileName);
            if (!alreadyIncluded) {
                // Create a minimal file object for files not in uploadedFiles
                const fileFromRecents = recentFiles.find(f => f.name === fileName);
                if (fileFromRecents) {
                    taggedFiles.push({
                        ...fileFromRecents,
                        tags: tags
                    });
                } else {
                    // Last resort: create a basic file object
                    taggedFiles.push({
                        name: fileName,
                        size: 0,
                        type: 'unknown',
                        lastModified: new Date(),
                        tags: tags
                    });
                }
            }
        }
    });
    
    // Sort by number of tags (most tagged first), then by name
    return taggedFiles.sort((a, b) => {
        const tagDiff = b.tags.length - a.tags.length;
        return tagDiff !== 0 ? tagDiff : a.name.localeCompare(b.name);
    });
}

// File upload functionality
function initializeFileUpload() {
    // Create file input if it doesn't exist
    let fileInput = document.getElementById('file-upload-input');
    if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'file-upload-input';
        fileInput.multiple = true;
        fileInput.accept = '.txt,.md,.py,.js,.html,.css,.json,.xml,.pdf';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
    }

    fileInput.addEventListener('change', handleFileUpload);
}

// Handle file upload
async function handleFileUpload(event) {
    const files = event.target.files;
    
    for (let file of files) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit (increased for PDFs)
            console.log(`File ${file.name} too large, skipping`);
            continue;
        }

        try {
            let content;
            let isPdf = false;
            let pdfBlob = null;
            
            if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                content = await readPdfContent(file);
                isPdf = true;
                pdfBlob = file; // Store the actual PDF file for viewing
            } else {
                content = await readFileContent(file);
            }
            
            const fileData = {
                name: file.name,
                size: file.size,
                type: file.type,
                content: content,
                isPdf: isPdf,
                pdfBlob: pdfBlob,
                lastModified: new Date(file.lastModified)
            };
            
            // Check if file already exists
            const existingIndex = uploadedFiles.findIndex(f => f.name === file.name);
            if (existingIndex >= 0) {
                uploadedFiles[existingIndex] = fileData; // Update existing
            } else {
                uploadedFiles.push(fileData); // Add new
                // Create initial version for version control
                createFileVersion(file.name, content, 'File uploaded');
            }
            persistState(); // Save state after file upload
        } catch (error) {
            console.error(`Error reading file ${file.name}:`, error);
        }
    }
    
    console.log(`Loaded ${uploadedFiles.length} files`);
    updateFilesList();
}

// Read file content
function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

// Load PDF.js library if not already loaded
function loadPdfJs() {
    return new Promise((resolve, reject) => {
        if (window.pdfjsLib) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
            // Set worker
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Read PDF content
async function readPdfContent(file) {
    try {
        await loadPdfJs();
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const typedarray = new Uint8Array(e.target.result);
                    const pdf = await pdfjsLib.getDocument(typedarray).promise;
                    let fullText = '';
                    
                    // Extract text from all pages
                    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                        const page = await pdf.getPage(pageNum);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => item.str).join(' ');
                        fullText += `--- Page ${pageNum} ---\n${pageText}\n\n`;
                    }
                    
                    resolve(fullText || '[PDF content could not be extracted]');
                } catch (error) {
                    console.error('PDF parsing error:', error);
                    resolve('[PDF content could not be extracted - file may be password protected or corrupted]');
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    } catch (error) {
        console.error('PDF.js loading error:', error);
        return '[PDF support not available - PDF.js failed to load]';
    }
}

// Search files
function searchFiles(query) {
    if (!query.trim()) {
        return [];
    }

    const results = [];
    const searchTerm = query.toLowerCase();

    uploadedFiles.forEach(file => {
        const content = file.content.toLowerCase();
        const name = file.name.toLowerCase();
        
        // Check if query matches filename or content
        if (name.includes(searchTerm) || content.includes(searchTerm)) {
            // Find matching lines/chunks
            const lines = file.content.split('\n');
            const matchingLines = lines
                .map((line, index) => ({ line: line.trim(), number: index + 1 }))
                .filter(item => item.line.toLowerCase().includes(searchTerm))
                .slice(0, 3); // Limit to 3 matching lines per file

            results.push({
                fileName: file.name,
                matchingLines: matchingLines,
                fileSize: file.size,
                lastModified: file.lastModified,
                fullContent: file.content
            });
        }
    });

    return results;
}

// Display search results
function displaySearchResults(results, query) {
    if (results.length === 0) {
        displayReferencedFiles([]); // Show empty state
        return;
    }

    const fileNames = results.map(result => result.fileName);
    displayReferencedFiles(fileNames);
    
    // Add click handlers for file viewing
    setTimeout(() => {
        results.forEach(result => {
            const fileDiv = document.querySelector(`[data-filepath="${result.fileName}"]`);
            if (fileDiv) {
                fileDiv.addEventListener('click', () => {
                    displayFileContentInContainer(result.fileName, result.fullContent, result.matchingLines, query);
                });
            }
        });
    }, 100);
}

// Display file content in overlay
function displayFileContentInContainer(fileName, content, matchingLines, query, highZIndex = false) {
    // Remove any existing overlay
    const existingOverlay = document.getElementById('file-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }

    // Find the file data to check if it's a PDF
    const fileData = uploadedFiles.find(f => f.name === fileName);
    const isPdf = fileData && fileData.isPdf;

    // Track this file as recently viewed
    trackRecentFile(fileData, query);

    // Create overlay that appears in the center
    const overlay = document.createElement('div');
    overlay.id = 'file-overlay';
    const zIndex = highZIndex ? 1003 : 1000;
    overlay.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80vw;
        height: 85vh;
        background: rgba(0, 0, 0, 0.95);
        backdrop-filter: blur(5px);
        z-index: ${zIndex};
        display: flex;
        flex-direction: column;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: fadeInScale 0.3s ease-out;
    `;

    // Add CSS animation
    if (!document.getElementById('overlay-styles')) {
        const style = document.createElement('style');
        style.id = 'overlay-styles';
        style.textContent = `
            @keyframes fadeInScale {
                from { 
                    transform: translate(-50%, -50%) scale(0.8); 
                    opacity: 0; 
                }
                to { 
                    transform: translate(-50%, -50%) scale(1); 
                    opacity: 1; 
                }
            }
            @keyframes fadeOutScale {
                from { 
                    transform: translate(-50%, -50%) scale(1); 
                    opacity: 1; 
                }
                to { 
                    transform: translate(-50%, -50%) scale(0.8); 
                    opacity: 0; 
                }
            }
        `;
        document.head.appendChild(style);
    }

    overlay.innerHTML = `
        <div class="overlay-header" style="
            padding: 20px 30px;
            border-bottom: 2px solid #444444;
            background-color: rgba(255, 255, 255, 0.1);
            flex-shrink: 0;
        ">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                    <h2 style="margin: 0; color: #ffffff; font-size: 22px;">📄 ${escapeHtml(fileName)}</h2>
                    ${query && query.includes('Version') && query.includes('Preview') ? `
                        <div style="color: #ffc107; font-size: 14px; margin-top: 4px; font-weight: 500;">
                            👁️ ${escapeHtml(query)}
                        </div>
                    ` : query ? `
                        <div style="color: #888; font-size: 14px; margin-top: 4px;">Search: "${escapeHtml(query)}"</div>
                    ` : ''}
                </div>
                <div>
                    ${isPdf ? `
                        <button id="toggle-pdf-view" style="
                            background: #28a745; 
                            color: white; 
                            border: none; 
                            padding: 8px 12px; 
                            border-radius: 4px; 
                            cursor: pointer;
                            font-size: 12px;
                            margin-right: 8px;
                        ">📄 PDF View</button>
                    ` : ''}
                    ${!isPdf ? `
                        <button id="edit-file-btn" style="
                            background: #ffc107; 
                            color: #212529; 
                            border: none; 
                            padding: 8px 12px; 
                            border-radius: 4px; 
                            cursor: pointer;
                            font-size: 12px;
                            margin-right: 8px;
                            font-weight: 500;
                        ">✏️ Edit</button>
                    ` : ''}
                    ${query && query.includes('Version') && query.includes('Preview') ? `
                        <button id="back-to-history-btn" style="
                            background: #6c757d; 
                            color: white; 
                            border: none; 
                            padding: 8px 12px; 
                            border-radius: 4px; 
                            cursor: pointer;
                            font-size: 12px;
                            margin-right: 8px;
                        ">← Back to History</button>
                    ` : ''}
                    <button id="minimize-file" style="
                        background: #555; 
                        color: white; 
                        border: none; 
                        padding: 8px 12px; 
                        border-radius: 4px; 
                        cursor: pointer;
                        font-size: 12px;
                        margin-right: 8px;
                    ">_</button>
                    <button id="close-file-overlay" style="
                        background: #d73a49; 
                        color: white; 
                        border: none; 
                        padding: 8px 12px; 
                        border-radius: 4px; 
                        cursor: pointer;
                        font-size: 12px;
                    ">✕</button>
                </div>
            </div>
            <div id="tags-section" style="margin-top: 15px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <span style="color: #ccc; font-size: 14px; font-weight: 500;">🏷️ Tags:</span>
                    <input type="text" id="tag-input" placeholder="Add tags (press Enter)" style="
                        background: #333; 
                        border: 1px solid #555; 
                        color: white; 
                        padding: 4px 8px; 
                        border-radius: 4px; 
                        font-size: 12px;
                        min-width: 150px;
                    ">
                    <button id="add-tag-btn" style="
                        background: #007acc; 
                        color: white; 
                        border: none; 
                        padding: 4px 8px; 
                        border-radius: 4px; 
                        cursor: pointer;
                        font-size: 12px;
                    ">Add</button>
                </div>
                <div id="tags-display" style="display: flex; flex-wrap: wrap; gap: 6px; min-height: 20px;">
                    ${renderFileTags(fileName)}
                </div>
            </div>
        </div>
        <div class="overlay-content" id="overlay-content" style="
            flex: 1;
            overflow-y: auto;
            background: #1a1a1a;
            padding: 0;
        ">
            ${isPdf ? createPdfViewer(fileData, query) : createFileContentDisplay(fileName, content, query)}
        </div>
    `;

    // Add to body
    document.body.appendChild(overlay);

    // Add event listeners
    document.getElementById('close-file-overlay').addEventListener('click', closeFileOverlay);
    document.getElementById('minimize-file').addEventListener('click', minimizeFileOverlay);
    
    // Setup tag management
    setupTagEventListeners(fileName);
    
    // Edit file button
    const editBtn = document.getElementById('edit-file-btn');
    if (editBtn && !isPdf) {
        editBtn.addEventListener('click', () => {
            openFileEditor(fileName, content);
        });
    }
    
    // Back to History button (for version previews)
    const backToHistoryBtn = document.getElementById('back-to-history-btn');
    if (backToHistoryBtn) {
        backToHistoryBtn.addEventListener('click', () => {
            console.log('Back to History clicked');
            closeFileOverlay();
            
            // Try to restore the hidden version history overlay first
            const existingVersionOverlay = document.getElementById('version-history-overlay');
            if (existingVersionOverlay) {
                console.log('Restoring existing version history overlay');
                existingVersionOverlay.style.display = 'flex';
            } else {
                // If no existing overlay, create a new one
                console.log('Creating new version history overlay');
                setTimeout(() => {
                    viewFileVersions(fileName);
                }, 50);
            }
        });
    }

    // PDF view toggle
    if (isPdf) {
        let showingPdfView = true;
        document.getElementById('toggle-pdf-view').addEventListener('click', () => {
            const overlayContent = document.getElementById('overlay-content');
            const toggleBtn = document.getElementById('toggle-pdf-view');
            
            if (showingPdfView) {
                // Switch to text view
                overlayContent.innerHTML = createFileContentDisplay(fileName, content, query);
                toggleBtn.textContent = '📄 PDF View';
                toggleBtn.style.background = '#28a745';
                showingPdfView = false;
            } else {
                // Switch to PDF view
                overlayContent.innerHTML = createPdfViewer(fileData, query);
                toggleBtn.textContent = '📝 Text View';
                toggleBtn.style.background = '#007acc';
                showingPdfView = true;
            }
        });
    }

    // Close on escape key
    document.addEventListener('keydown', handleOverlayKeydown);

    // Close on click outside (optional)
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeFileOverlay();
        }
    });
}

// Create PDF viewer with embedded PDF display
function createPdfViewer(fileData, query) {
    // Create blob URL for the PDF
    const pdfUrl = URL.createObjectURL(fileData.pdfBlob);
    
    return `
        <div style="
            height: 100%;
            display: flex;
            flex-direction: column;
            background: #2a2a2a;
        ">
            ${query ? `
                <div style="
                    background: rgba(255, 255, 0, 0.1);
                    padding: 10px 20px;
                    border-bottom: 1px solid #444;
                    color: #ffff00;
                    font-size: 12px;
                ">
                    🔍 Search term "${escapeHtml(query)}" found in extracted text. Use "Text View" to see highlighted results.
                </div>
            ` : ''}
            <div style="
                flex: 1;
                position: relative;
                background: #404040;
            ">
                <embed 
                    src="${pdfUrl}" 
                    type="application/pdf" 
                    style="
                        width: 100%; 
                        height: 100%; 
                        border: none;
                        background: white;
                    "
                    title="PDF Viewer for ${escapeHtml(fileData.name)}"
                />
                <div style="
                    position: absolute;
                    bottom: 10px;
                    right: 10px;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    padding: 5px 10px;
                    border-radius: 4px;
                    font-size: 11px;
                    pointer-events: none;
                ">
                    ${Math.round(fileData.size / 1024)}KB
                </div>
            </div>
        </div>
    `;
}

// Create file content display based on file type
function createFileContentDisplay(fileName, content, query) {
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    const isCode = /\.(py|js|html|css|json|xml|md)$/i.test(fileName);
    
    let displayContent = escapeHtml(content);
    
    // Apply search highlighting
    if (query && query.trim()) {
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        displayContent = displayContent.replace(regex, '<mark style="background: #ffff00; color: #000; padding: 2px 4px; border-radius: 3px;">$1</mark>');
    }
    
    // Style based on file type
    if (isPdf) {
        return `
            <div style="
                margin: 0; 
                padding: 30px; 
                font-size: 14px; 
                line-height: 1.8;
                color: #ffffff;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                min-height: 100%;
                box-sizing: border-box;
            ">
                <div style="
                    background: rgba(255, 255, 255, 0.05);
                    padding: 15px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    border-left: 4px solid #ff6b6b;
                ">
                    📄 PDF Content Extracted
                    <div style="font-size: 12px; color: #888; margin-top: 5px;">
                        Text has been extracted from the PDF. Formatting may not be preserved.
                    </div>
                </div>
                <div style="white-space: pre-wrap;">${displayContent}</div>
            </div>
        `;
    } else if (isCode) {
        return `
            <pre style="
                margin: 0; 
                padding: 30px; 
                white-space: pre-wrap; 
                font-size: 14px; 
                line-height: 1.6;
                color: #ffffff;
                font-family: 'Courier New', monospace;
                min-height: 100%;
                box-sizing: border-box;
            ">${displayContent}</pre>
        `;
    } else {
        return `
            <div style="
                margin: 0; 
                padding: 30px; 
                white-space: pre-wrap; 
                font-size: 14px; 
                line-height: 1.7;
                color: #ffffff;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                min-height: 100%;
                box-sizing: border-box;
            ">${displayContent}</div>
        `;
    }
}

// Close file overlay with animation
function closeFileOverlay() {
    const overlay = document.getElementById('file-overlay');
    if (overlay) {
        overlay.style.animation = 'fadeOutScale 0.3s ease-in';
        setTimeout(() => {
            overlay.remove();
            document.removeEventListener('keydown', handleOverlayKeydown);
        }, 300);
    }
}

// Open file editor
function openFileEditor(fileName, content) {
    // Close any existing overlays
    closeFileOverlay();
    closeFileEditor(); // Also close any existing editor overlay
    
    // Create editor overlay
    const editorOverlay = document.createElement('div');
    editorOverlay.id = 'file-editor-overlay';
    editorOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 1004;
        display: flex;
        flex-direction: column;
    `;
    
    editorOverlay.innerHTML = `
        <div class="editor-header" style="
            padding: 20px 30px;
            border-bottom: 2px solid #444444;
            background-color: rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
        ">
            <div>
                <h2 style="margin: 0; color: #ffffff; font-size: 22px;">✏️ Editing: ${escapeHtml(fileName)}</h2>
                <p style="margin: 5px 0 0 0; color: #888; font-size: 14px;">Make your changes below and save when ready</p>
            </div>
            <div>
                <button id="save-file-btn" style="
                    background: #28a745; 
                    color: white; 
                    border: none; 
                    padding: 8px 16px; 
                    border-radius: 4px; 
                    cursor: pointer;
                    font-size: 12px;
                    margin-right: 8px;
                    font-weight: 500;
                    pointer-events: auto;
                    position: relative;
                    z-index: 1001;
                " onmouseover="this.style.background='#218838'" onmouseout="this.style.background='#28a745'" 
                onclick="console.log('Save clicked via onclick'); saveFileChanges('${escapeHtml(fileName)}');">💾 Save</button>
                <button id="cancel-edit-btn" style="
                    background: #555; 
                    color: white; 
                    border: none; 
                    padding: 8px 12px; 
                    border-radius: 4px; 
                    cursor: pointer;
                    font-size: 12px;
                    margin-right: 8px;
                    pointer-events: auto;
                    position: relative;
                    z-index: 1001;
                " onmouseover="this.style.background='#666'" onmouseout="this.style.background='#555'"
                onclick="console.log('Cancel clicked via onclick'); closeFileEditor();">Cancel</button>
                <button id="close-editor-btn" style="
                    background: #d73a49; 
                    color: white; 
                    border: none; 
                    padding: 8px 12px; 
                    border-radius: 4px; 
                    cursor: pointer;
                    font-size: 12px;
                    pointer-events: auto;
                    position: relative;
                    z-index: 1001;
                " onmouseover="this.style.background='#c82333'" onmouseout="this.style.background='#d73a49'"
                onclick="console.log('Close clicked via onclick'); closeFileEditor();">✕</button>
            </div>
        </div>
        <div class="editor-content" style="
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 20px;
        ">
            <div style="margin-bottom: 15px;">
                <label for="change-description" style="color: #ccc; font-size: 14px; margin-bottom: 5px; display: block;">
                    Change Description:
                </label>
                <input type="text" id="change-description" placeholder="Describe what you changed..." style="
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #555;
                    border-radius: 4px;
                    background: #333;
                    color: white;
                    font-size: 14px;
                    box-sizing: border-box;
                ">
            </div>
            <textarea id="file-content-editor" style="
                flex: 1;
                width: 100%;
                padding: 15px;
                border: 1px solid #555;
                border-radius: 4px;
                background: #1a1a1a;
                color: #ffffff;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                line-height: 1.5;
                resize: none;
                box-sizing: border-box;
            ">${escapeHtml(content)}</textarea>
        </div>
    `;
    
    document.body.appendChild(editorOverlay);
    
    // Add event listeners with slight delay to ensure DOM is ready
    setTimeout(() => {
        const saveBtn = document.getElementById('save-file-btn');
        const cancelBtn = document.getElementById('cancel-edit-btn');
        const closeBtn = document.getElementById('close-editor-btn');
        const textArea = document.getElementById('file-content-editor');
        
        if (saveBtn) {
            console.log('Attaching save button listener');
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Save button clicked!');
                saveFileChanges(fileName);
            });
        } else {
            console.error('Save button not found!');
        }
        
        if (cancelBtn) {
            console.log('Attaching cancel button listener');
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Cancel button clicked!');
                closeFileEditor();
            });
        } else {
            console.error('Cancel button not found!');
        }
        
        if (closeBtn) {
            console.log('Attaching close button listener');
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Close button clicked!');
                closeFileEditor();
            });
        } else {
            console.error('Close button not found!');
        }
        
        // Focus on the textarea
        if (textArea) {
            textArea.focus();
        }
    }, 10);
    
    // Handle Ctrl+S for save
    document.addEventListener('keydown', handleEditorKeydown);
}

function saveFileChanges(fileName) {
    console.log(`Attempting to save file: ${fileName}`);
    
    const editorElement = document.getElementById('file-content-editor');
    const descriptionElement = document.getElementById('change-description');
    
    if (!editorElement) {
        console.error('File editor element not found');
        return;
    }
    
    const newContent = editorElement.value;
    const changeDescription = (descriptionElement ? descriptionElement.value.trim() : '') || 'File edited';
    
    console.log(`Content length: ${newContent.length}, Description: ${changeDescription}`);
    
    const saveResult = saveFileEdit(fileName, newContent, changeDescription);
    console.log(`Save result: ${saveResult}`);
    
    if (saveResult) {
        // Show success message
        const saveBtn = document.getElementById('save-file-btn');
        if (saveBtn) {
            const originalText = saveBtn.textContent;
            saveBtn.textContent = '✅ Saved!';
            saveBtn.style.background = '#28a745';
            
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.style.background = '#28a745'; // Keep green
                closeFileEditor();
            }, 1000);
        }
    } else {
        console.error('Failed to save file');
        const saveBtn = document.getElementById('save-file-btn');
        if (saveBtn) {
            saveBtn.textContent = '❌ Error';
            saveBtn.style.background = '#dc3545';
        }
    }
}

function closeFileEditor() {
    console.log('CloseFileEditor called');
    const overlay = document.getElementById('file-editor-overlay');
    if (overlay) {
        console.log('Removing editor overlay');
        overlay.remove();
    } else {
        console.log('Editor overlay not found');
    }
    document.removeEventListener('keydown', handleEditorKeydown);
    console.log('Editor closed');
}

function handleEditorKeydown(e) {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        const fileName = document.querySelector('.editor-header h2').textContent.replace('✏️ Editing: ', '');
        saveFileChanges(fileName);
    } else if (e.key === 'Escape') {
        closeFileEditor();
    }
}

// Minimize file overlay (reduce to small corner)
function minimizeFileOverlay() {
    const overlay = document.getElementById('file-overlay');
    if (overlay) {
        const isMinimized = overlay.getAttribute('data-minimized') === 'true';
        
        if (isMinimized) {
            // Restore to full size
            overlay.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 80vw;
                height: 85vh;
                background: rgba(0, 0, 0, 0.95);
                backdrop-filter: blur(5px);
                z-index: 1000;
                display: flex;
                flex-direction: column;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                transition: all 0.3s ease;
            `;
            overlay.setAttribute('data-minimized', 'false');
            document.getElementById('minimize-file').textContent = '_';
        } else {
            // Minimize to corner
            overlay.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                width: 300px;
                height: 200px;
                background: rgba(0, 0, 0, 0.95);
                backdrop-filter: blur(5px);
                z-index: 1000;
                display: flex;
                flex-direction: column;
                border-radius: 8px;
                border: 2px solid #444;
                transition: all 0.3s ease;
            `;
            overlay.setAttribute('data-minimized', 'true');
            document.getElementById('minimize-file').textContent = '□';
        }
    }
}

// Handle keyboard shortcuts
function handleOverlayKeydown(e) {
    if (e.key === 'Escape') {
        closeFileOverlay();
    } else if (e.key === 'm' || e.key === 'M') {
        minimizeFileOverlay();
    }
}

// Update files list display
function updateFilesList() {
    const container2Content = document.querySelector('#container2 .container-content');
    if (container2Content && uploadedFiles.length > 0) {
        container2Content.innerHTML = `
            <div style="padding: 16px; text-align: center; color: #fff;">
                📁 ${uploadedFiles.length} files loaded
                <br><small style="color: #888;">Use the search box to find content</small>
            </div>
        `;
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Version control functions
function createFileVersion(fileName, content, changeDescription = 'File uploaded') {
    if (!fileVersions.has(fileName)) {
        fileVersions.set(fileName, []);
    }
    
    const versions = fileVersions.get(fileName);
    const version = {
        id: Date.now(),
        version: versions.length + 1,
        content: content,
        timestamp: new Date(),
        description: changeDescription,
        size: new Blob([content]).size
    };
    
    versions.push(version);
    updateVersionControlIndicator();
    persistState(); // Save state after creating version
    return version;
}

function saveFileEdit(fileName, newContent, changeDescription) {
    // Find the original file
    let originalFile = uploadedFiles.find(f => f.name === fileName);
    
    // If not found in uploadedFiles, create a new entry (for AI-referenced files)
    if (!originalFile) {
        originalFile = {
            name: fileName,
            content: newContent,
            size: new Blob([newContent]).size,
            type: fileName.split('.').pop(),
            isPdf: fileName.toLowerCase().endsWith('.pdf'),
            lastModified: new Date()
        };
        uploadedFiles.push(originalFile);
        console.log(`Added ${fileName} to uploadedFiles for saving`);
    } else {
        // Update existing file content
        originalFile.content = newContent;
        originalFile.size = new Blob([newContent]).size;
        originalFile.lastModified = new Date();
    }
    
    // Create version before updating
    createFileVersion(fileName, newContent, changeDescription);
    
    // Mark as modified
    modifiedFiles.add(fileName);
    
    // Update recent files if exists
    const recentFile = recentFiles.find(f => f.name === fileName);
    if (recentFile) {
        recentFile.content = newContent;
        recentFile.size = originalFile.size;
    }
    
    // Update displays
    updateVersionControlIndicator();
    updateRecentFilesDisplay();
    
    // Persist state after file modification
    persistState();
    
    return true;
}

function getFileVersions(fileName) {
    return fileVersions.get(fileName) || [];
}

function getModifiedFilesCount() {
    return modifiedFiles.size;
}

// Tag management functions
function renderFileTags(fileName) {
    const tags = fileTags.get(fileName) || [];
    if (tags.length === 0) {
        return '<span style="color: #666; font-size: 12px; font-style: italic;">No tags yet</span>';
    }
    
    return tags.map(tag => `
        <span class="file-tag" data-tag="${escapeHtml(tag)}" style="
            background: rgba(0, 122, 204, 0.2);
            color: #5dade2;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
            border: 1px solid rgba(0, 122, 204, 0.3);
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        " title="Click to remove tag">
            ${escapeHtml(tag)}
            <span style="
                color: #e74c3c;
                font-weight: bold;
                font-size: 10px;
                cursor: pointer;
            " onclick="removeFileTag('${escapeHtml(fileName)}', '${escapeHtml(tag)}')">×</span>
        </span>
    `).join('');
}

function addFileTag(fileName, tag) {
    if (!tag || tag.trim() === '') return;
    
    tag = tag.trim().toLowerCase();
    
    if (!fileTags.has(fileName)) {
        fileTags.set(fileName, []);
    }
    
    const tags = fileTags.get(fileName);
    if (!tags.includes(tag)) {
        tags.push(tag);
        updateTagsDisplay(fileName);
        updateRecentFilesDisplay(); // Refresh recent files to show new tags
        updateTagsIndicator(); // Update sidebar badge
        persistState(); // Save state after adding tag
    }
}

function removeFileTag(fileName, tag) {
    if (!fileTags.has(fileName)) return;
    
    const tags = fileTags.get(fileName);
    const index = tags.indexOf(tag);
    if (index > -1) {
        tags.splice(index, 1);
        updateTagsDisplay(fileName);
        updateRecentFilesDisplay(); // Refresh recent files to show updated tags
        persistState(); // Save state after removing tag
        updateTagsIndicator(); // Update sidebar badge
    }
}

function renderFileTagsInTable(fileName) {
    const tags = fileTags.get(fileName) || [];
    if (tags.length === 0) {
        return '<span style="color: #666; font-size: 11px; font-style: italic;">No tags</span>';
    }
    
    return tags.slice(0, 3).map(tag => `
        <span style="
            background: rgba(0, 122, 204, 0.2);
            color: #5dade2;
            padding: 2px 6px;
            border-radius: 8px;
            font-size: 10px;
            font-weight: 500;
            border: 1px solid rgba(0, 122, 204, 0.3);
        ">${escapeHtml(tag)}</span>
    `).join('') + (tags.length > 3 ? `<span style="color: #666; font-size: 10px;">+${tags.length - 3}</span>` : '');
}

function updateTagsDisplay(fileName) {
    const tagsDisplay = document.getElementById('tags-display');
    if (tagsDisplay) {
        tagsDisplay.innerHTML = renderFileTags(fileName);
    }
}

function setupTagEventListeners(fileName) {
    const tagInput = document.getElementById('tag-input');
    const addTagBtn = document.getElementById('add-tag-btn');
    
    if (tagInput && addTagBtn) {
        const addTag = () => {
            const tag = tagInput.value.trim();
            if (tag) {
                addFileTag(fileName, tag);
                tagInput.value = '';
            }
        };
        
        addTagBtn.addEventListener('click', addTag);
        tagInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
            }
        });
    }
}

function setupRecentFilesFilter() {
    const tagFilterInput = document.getElementById('tag-filter-input');
    const clearFilterBtn = document.getElementById('clear-tag-filter');
    
    if (tagFilterInput && clearFilterBtn) {
        tagFilterInput.addEventListener('input', (e) => {
            const filterTag = e.target.value.trim().toLowerCase();
            filterRecentFilesByTag(filterTag);
        });
        
        clearFilterBtn.addEventListener('click', () => {
            tagFilterInput.value = '';
            filterRecentFilesByTag('');
        });
    }
}

function filterRecentFilesByTag(filterTag) {
    const rows = document.querySelectorAll('.recent-file-row');
    
    rows.forEach(row => {
        const fileName = row.getAttribute('data-filename');
        const tags = fileTags.get(fileName) || [];
        
        if (!filterTag || tags.some(tag => tag.toLowerCase().includes(filterTag))) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function setupTagsFilter() {
    const tagsFilterInput = document.getElementById('tags-filter-input');
    const clearFilterBtn = document.getElementById('clear-tags-filter');
    
    if (tagsFilterInput && clearFilterBtn) {
        tagsFilterInput.addEventListener('input', (e) => {
            const filterText = e.target.value.trim().toLowerCase();
            filterTaggedFiles(filterText);
            
            // Visual feedback for active filter
            if (filterText) {
                tagsFilterInput.style.borderColor = '#28a745';
                tagsFilterInput.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
                clearFilterBtn.style.backgroundColor = '#28a745';
            } else {
                tagsFilterInput.style.borderColor = '#555';
                tagsFilterInput.style.backgroundColor = '#333';
                clearFilterBtn.style.backgroundColor = '#555';
            }
        });
        
        clearFilterBtn.addEventListener('click', () => {
            tagsFilterInput.value = '';
            filterTaggedFiles('');
            // Reset visual state
            tagsFilterInput.style.borderColor = '#555';
            tagsFilterInput.style.backgroundColor = '#333';
            clearFilterBtn.style.backgroundColor = '#555';
        });
    }
}

function filterTaggedFiles(filterText) {
    const rows = document.querySelectorAll('.tagged-file-row');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const fileName = row.getAttribute('data-filename');
        const tags = fileTags.get(fileName) || [];
        
        // Check if filter matches filename or any tag
        const matchesFileName = fileName.toLowerCase().includes(filterText);
        const matchesTags = tags.some(tag => tag.toLowerCase().includes(filterText));
        
        if (!filterText || matchesFileName || matchesTags) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Update the count in the header if it exists
    const countElement = document.querySelector('.tags-result-count');
    if (countElement) {
        if (filterText) {
            countElement.textContent = `${visibleCount} of ${rows.length} files shown`;
            countElement.style.color = visibleCount > 0 ? '#28a745' : '#dc3545';
        } else {
            countElement.textContent = `${getTaggedFilesCount()} files with tags`;
            countElement.style.color = '#888';
        }
    }
}

// Flow container left as is - no additional functionality

// Track recently viewed files
function trackRecentFile(fileData, searchQuery = '') {
    if (!fileData) return;
    
    const recentEntry = {
        ...fileData,
        viewedAt: new Date(),
        searchQuery: searchQuery || '',
        tags: fileTags.get(fileData.name) || []
    };
    
    // Remove if already exists
    recentFiles = recentFiles.filter(f => f.name !== fileData.name);
    
    // Add to beginning
    recentFiles.unshift(recentEntry);
    
    // Keep only MAX_RECENT_FILES
    if (recentFiles.length > MAX_RECENT_FILES) {
        recentFiles = recentFiles.slice(0, MAX_RECENT_FILES);
    }
    
    // Update recent files display if visible
    updateRecentFilesDisplay();
    
    // Persist state after adding to recent files
    persistState();
}

// Setup recents table
function setupRecentsTable() {
    const container2 = document.getElementById('container2');
    
    // Update to show proper table format like Tagged Files
    container2.innerHTML = `
        <div class="container-header" style="
            padding: 20px 30px 15px 30px;
            border-bottom: 2px solid #444444;
            background-color: #ff4444;
            display: flex;
            justify-content: space-between;
            align-items: center;
        ">
            <div>
                <h2 style="margin: 0; color: #ffffff; font-size: 24px;">📅 Recent Files</h2>
                <p style="margin: 5px 0 0 0; color: #ffffff; font-size: 14px;">${recentFiles.length} recently viewed files</p>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="text" id="tag-filter-input" placeholder="Filter by file name..." style="
                    background: #333; 
                    border: 1px solid #555; 
                    color: white; 
                    padding: 6px 10px; 
                    border-radius: 4px; 
                    font-size: 12px;
                    min-width: 120px;
                ">
                <button id="clear-tag-filter" style="
                    background: #555; 
                    color: white; 
                    border: none; 
                    padding: 6px 10px; 
                    border-radius: 4px; 
                    cursor: pointer;
                    font-size: 12px;
                ">Clear</button>
            </div>
        </div>
        <div class="container-content" style="
            padding: 20px;
            overflow-y: auto;
            height: calc(100% - 100px);
            display: flex;
            justify-content: center;
            align-items: flex-start;
        ">
            <div style="
                width: 90%;
                max-width: 1200px;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                overflow: hidden;
            ">
                ${createRecentsTable()}
            </div>
        </div>
    `;
    
    // Set up the filter and show universal back button
    setTimeout(() => {
        setupRecentFilesFilter();
        showUniversalBackButton();
    }, 100);
}

function setupBackButton() {
    const backButton = document.getElementById('back-to-home');
    if (backButton) {
        backButton.addEventListener('click', () => {
            returnToHomeScreen();
        });
    }
}

// Initialize universal back button
function initializeUniversalBackButton() {
    setupBackButton();
    hideUniversalBackButton(); // Start hidden
}

// Track if the back button animation has been shown
let backButtonAnimationShown = false;

// Show universal back button with pop-in animation (only once)
function showUniversalBackButton() {
    const universalBackBtn = document.getElementById('universal-back-btn');
    if (universalBackBtn) {
        // If already visible, don't animate again
        if (universalBackBtn.style.display === 'block') {
            return;
        }
        
        // Make visible first
        universalBackBtn.style.display = 'block';
        
        // Only animate if this is the first time showing it
        if (!backButtonAnimationShown) {
            // Remove any existing animation classes
            universalBackBtn.classList.remove('pop-out');
            
            // Force a reflow to ensure display change is applied
            universalBackBtn.offsetHeight;
            
            // Add pop-in animation
            universalBackBtn.classList.add('pop-in');
            
            // Remove the animation class after animation completes
            setTimeout(() => {
                universalBackBtn.classList.remove('pop-in');
            }, 500);
            
            // Mark animation as shown
            backButtonAnimationShown = true;
        }
    }
}

// Hide universal back button with pop-out animation
function hideUniversalBackButton() {
    const universalBackBtn = document.getElementById('universal-back-btn');
    if (universalBackBtn) {
        // Remove pop-in class if present
        universalBackBtn.classList.remove('pop-in');
        
        // Add pop-out animation
        universalBackBtn.classList.add('pop-out');
        
        // Hide after animation completes
        setTimeout(() => {
            universalBackBtn.style.display = 'none';
            universalBackBtn.classList.remove('pop-out');
        }, 300);
    }
}

// Setup tags table
function setupTagsTable() {
    const container2 = document.getElementById('container2');
    const taggedCount = getTaggedFilesCount();
    
    // Update to match Recent Files styling
    container2.innerHTML = `
        <div class="container-header" style="
            padding: 20px 30px 15px 30px;
            border-bottom: 2px solid #444444;
            background-color: #ff4444;
            display: flex;
            justify-content: space-between;
            align-items: center;
        ">
            <div>
                <h2 style="margin: 0; color: #ffffff; font-size: 24px;">🏷️ Tagged Files</h2>
                <p class="tags-result-count" style="margin: 5px 0 0 0; color: #ffffff; font-size: 14px;">${taggedCount} files with tags</p>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="text" id="tags-filter-input" placeholder="Filter by tag..." style="
                    background: #333; 
                    border: 1px solid #555; 
                    color: white; 
                    padding: 6px 10px; 
                    border-radius: 4px; 
                    font-size: 12px;
                    min-width: 180px;
                ">
                <button id="clear-tags-filter" style="
                    background: #555; 
                    color: white; 
                    border: none; 
                    padding: 6px 10px; 
                    border-radius: 4px; 
                    cursor: pointer;
                    font-size: 12px;
                ">Clear</button>
            </div>
        </div>
        <div class="container-content" style="
            padding: 20px;
            overflow-y: auto;
            height: calc(100% - 100px);
            display: flex;
            justify-content: center;
            align-items: flex-start;
        ">
            <div style="
                width: 90%;
                max-width: 1200px;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                overflow: hidden;
            ">
                ${createTagsTable()}
            </div>
        </div>
    `;
    
    // Set up the tags filter and show universal back button
    setTimeout(() => {
        setupTagsFilter();
        showUniversalBackButton();
    }, 100);
}

// Setup version control table
function setupVersionControlTable() {
    const container2 = document.getElementById('container2');
    const modifiedCount = getModifiedFilesCount();
    
    // Update to match Recent Files styling
    container2.innerHTML = `
        <div class="container-header" style="
            padding: 20px 30px 15px 30px;
            border-bottom: 2px solid #444444;
            background-color: #ff4444;
            display: flex;
            justify-content: space-between;
            align-items: center;
        ">
            <div>
                <h2 style="margin: 0; color: #ffffff; font-size: 24px;">📋 Version Control</h2>
                <p style="margin: 5px 0 0 0; color: #ffffff; font-size: 14px;">${modifiedCount} modified files</p>
            </div>
        </div>
        <div class="container-content" style="
            padding: 20px;
            overflow-y: auto;
            height: calc(100% - 100px);
            display: flex;
            justify-content: center;
            align-items: flex-start;
        ">
            <div style="
                width: 90%;
                max-width: 1200px;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                overflow: hidden;
            ">
                ${createVersionControlTable()}
            </div>
        </div>
    `;
    
    // Show universal back button
    setTimeout(() => {
        showUniversalBackButton();
    }, 100);
}

// Create the recents table
function createRecentsTable() {
    if (recentFiles.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">📂</div>
                <h3>No Recent Files</h3>
                <p>Files you view will appear here for quick access.</p>
            </div>
        `;
    }

    return `
        <table class="recent-files-table">
            <thead>
                <tr>
                    <th>📄 File Name</th>
                    <th>🏷️ Tags</th>
                    <th>📊 Size</th>
                    <th>👀 Viewed</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${recentFiles.map((file, index) => createRecentsTableRow(file, index)).join('')}
            </tbody>
        </table>
    `;
}

// Create individual recent file table row
function createRecentsTableRow(file, index) {
    const timeAgo = getTimeAgo(file.viewedAt);
    const fileSize = formatFileSize(file.size);
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const fileIcon = getFileIcon(fileExtension, file.isPdf);
    const tags = fileTags.get(file.name) || [];
    
    return `
        <tr class="recent-file-row" data-filename="${escapeHtml(file.name)}">
            <td>
                <div class="file-info">
                    <span class="file-icon">${fileIcon}</span>
                    <div>
                        <div class="file-name">${escapeHtml(file.name)}</div>
                        <div class="file-type">${fileExtension.toUpperCase()} File</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="tags-container">
                    ${tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                    ${tags.length === 0 ? '<span style="color: #666; font-size: 12px;">No tags</span>' : ''}
                </div>
            </td>
            <td>
                <span class="file-size">${fileSize}</span>
            </td>
            <td>
                <div class="viewed-time">${timeAgo}</div>
                <div style="color: #666; font-size: 11px; margin-top: 2px;">
                    ${file.viewedAt.toLocaleDateString()}
                </div>
            </td>
            <td class="actions-cell">
                <div class="button-group">
                    <button onclick="viewFile(${index})" class="view-btn">👁️ View</button>
                    <button onclick="editFile(${index})" class="edit-btn">✏️ Edit</button>
                    <button onclick="tagFile(${index})" class="tag-btn">🏷️ Tag</button>
                    <button onclick="deleteRecentFile(${index})" class="delete-btn">🗑️ Delete</button>
                </div>
            </td>
        </tr>
    `;
}

// Create the tags table
function createTagsTable() {
    const taggedFiles = getAllTaggedFiles();
    
    if (taggedFiles.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">🏷️</div>
                <h3>No Tagged Files</h3>
                <p>Files you tag will appear here organized by tags.</p>
            </div>
        `;
    }

    return `
        <table class="tags-table">
            <thead>
                <tr>
                    <th>📄 File Name</th>
                    <th>🏷️ Tags</th>
                    <th>📊 Size</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${taggedFiles.map((file, index) => createTagsTableRow(file, index)).join('')}
            </tbody>
        </table>
    `;
}

// Create the version control table
function createVersionControlTable() {
    const modifiedFilesArray = Array.from(modifiedFiles);
    
    if (modifiedFilesArray.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <h3>No Modified Files</h3>
                <p>Files you edit will appear here with version history.</p>
            </div>
        `;
    }

    return `
        <table class="version-control-table">
            <thead>
                <tr>
                    <th>📄 File Name</th>
                    <th>📊 Versions</th>
                    <th>📅 Last Modified</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${modifiedFilesArray.map((fileName, index) => createVersionControlRow(fileName, index)).join('')}
            </tbody>
        </table>
    `;
}

// Create individual recent file card
function createRecentFileCard(file, index) {
    const timeAgo = getTimeAgo(file.viewedAt);
    const fileSize = formatFileSize(file.size);
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const fileIcon = getFileIcon(fileExtension, file.isPdf);
    const tags = fileTags.get(file.name) || [];
    
    return `
        <div class="recent-file-row info-container" data-filename="${escapeHtml(file.name)}" style="
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
        " onmouseover="this.style.background='rgba(255,255,255,0.15)'; this.style.borderColor='rgba(255,255,255,0.3)'" 
           onmouseout="this.style.background='rgba(255,255,255,0.1)'; this.style.borderColor='rgba(255,255,255,0.2)'">
            
            <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 15px;">
                <div style="display: flex; align-items: center; gap: 15px; flex: 1;">
                    <span style="font-size: 32px;">${fileIcon}</span>
                    <div style="flex: 1;">
                        <h3 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 600;">
                            ${escapeHtml(file.name)}
                        </h3>
                        <p style="margin: 5px 0 0 0; color: #888; font-size: 14px;">
                            ${fileExtension.toUpperCase()} File • ${fileSize}
                        </p>
                    </div>
                </div>
                
                <button onclick="openRecentFile('${escapeHtml(file.name)}')" style="
                    background: #007acc;
                    color: white;
                    border: none;
                    padding: 10px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 500;
                    transition: all 0.2s ease;
                " onmouseover="this.style.background='#005a9e'" 
                   onmouseout="this.style.background='#007acc'">
                    👁️ View File
                </button>
            </div>
            
            <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-bottom: 15px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="color: #888; font-size: 12px;">📅</span>
                    <span style="color: #ccc; font-size: 13px;">${timeAgo}</span>
                    <span style="color: #666; font-size: 12px;">(${file.viewedAt.toLocaleDateString()})</span>
                </div>
                
                ${file.searchQuery ? `
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="color: #888; font-size: 12px;">🔍</span>
                        <span style="
                            background: rgba(255, 255, 0, 0.2);
                            color: #ffff00;
                            padding: 4px 8px;
                            border-radius: 4px;
                            font-size: 11px;
                            font-weight: 500;
                        ">"${escapeHtml(file.searchQuery)}"</span>
                    </div>
                ` : ''}
            </div>
            
            ${tags.length > 0 ? `
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <span style="color: #888; font-size: 12px;">🏷️</span>
                    ${tags.slice(0, 5).map(tag => `
                        <span style="
                            background: rgba(0, 122, 204, 0.2);
                            color: #5dade2;
                            padding: 4px 8px;
                            border-radius: 12px;
                            font-size: 11px;
                            font-weight: 500;
                            border: 1px solid rgba(0, 122, 204, 0.3);
                        ">${escapeHtml(tag)}</span>
                    `).join('')}
                    ${tags.length > 5 ? `<span style="color: #666; font-size: 11px;">+${tags.length - 5} more</span>` : ''}
                </div>
            ` : '<div style="color: #666; font-size: 12px; font-style: italic;">No tags</div>'}
        </div>
    `;
}

// Create individual table row
function createTableRow(file, index) {
    const timeAgo = getTimeAgo(file.viewedAt);
    const fileSize = formatFileSize(file.size);
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const fileIcon = getFileIcon(fileExtension, file.isPdf);
    
    return `
        <tr class="recent-file-row" data-filename="${escapeHtml(file.name)}" style="
            border-bottom: 1px solid #333;
            transition: all 0.2s ease;
            cursor: pointer;
        " onmouseover="this.style.background='rgba(255,255,255,0.05)'" 
           onmouseout="this.style.background='transparent'">
            <td style="padding: 16px 20px; vertical-align: middle;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 20px;">${fileIcon}</span>
                    <div>
                        <div style="color: #ffffff; font-weight: 500; font-size: 14px;">
                            ${escapeHtml(file.name)}
                        </div>
                        <div style="color: #888; font-size: 12px; margin-top: 2px;">
                            ${fileExtension.toUpperCase()} File
                        </div>
                    </div>
                </div>
            </td>
            <td style="padding: 16px 20px; vertical-align: middle;">
                <div style="color: #ccc; font-size: 13px;">${timeAgo}</div>
                <div style="color: #666; font-size: 11px; margin-top: 2px;">
                    ${file.viewedAt.toLocaleDateString()}
                </div>
            </td>
            <td style="padding: 16px 20px; vertical-align: middle;">
                ${file.searchQuery ? `
                    <span style="
                        background: rgba(255, 255, 0, 0.2);
                        color: #ffff00;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 11px;
                        font-weight: 500;
                    ">"${escapeHtml(file.searchQuery)}"</span>
                ` : '<span style="color: #666; font-size: 12px;">—</span>'}
            </td>
            <td style="padding: 16px 20px; vertical-align: middle;">
                <div style="display: flex; flex-wrap: wrap; gap: 4px; max-width: 200px;">
                    ${renderFileTagsInTable(file.name)}
                </div>
            </td>
            <td style="padding: 16px 20px; vertical-align: middle;">
                <span style="color: #ccc; font-size: 13px;">${fileSize}</span>
            </td>
            <td style="padding: 16px 20px; vertical-align: middle; text-align: center;">
                <button onclick="openRecentFile('${escapeHtml(file.name)}')" style="
                    background: #007acc;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.2s ease;
                " onmouseover="this.style.background='#005a9e'" 
                   onmouseout="this.style.background='#007acc'">
                    👁️ View
                </button>
            </td>
        </tr>
    `;
}

// Create individual table row for tags view
function createTaggedFileCard(file, index) {
    return `
        <div class="file-container" style="
            background: linear-gradient(135deg, #2a2a2a, #3a3a3a);
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #444;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
        " onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 15px 45px rgba(0, 0, 0, 0.4)';" 
        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 32px rgba(0, 0, 0, 0.3)';">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="
                    background: linear-gradient(135deg, #4a90e2, #357abd);
                    width: 50px;
                    height: 50px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    color: white;
                    box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
                ">
                    📄
                </div>
                
                <div style="flex: 1;">
                    <div style="
                        color: #ffffff;
                        font-size: 16px;
                        font-weight: 600;
                        margin-bottom: 5px;
                        word-break: break-word;
                    ">
                        ${file.name}
                    </div>
                    
                    <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 5px;">
                        ${fileTags.get(file.name) ? fileTags.get(file.name).map(tag => `
                            <span style="
                                background: linear-gradient(135deg, #ff6b6b, #ee5a52);
                                color: white;
                                padding: 3px 8px;
                                border-radius: 15px;
                                font-size: 11px;
                                font-weight: 500;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                                box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
                            ">${tag}</span>
                        `).join('') : ''}
                    </div>
                    
                    <div style="
                        color: #cccccc;
                        font-size: 12px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    ">
                        <span>📊 ${formatFileSize(file.size)}</span>
                    </div>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button onclick="viewFile(${index})" style="
                        background: linear-gradient(135deg, #4a90e2, #357abd);
                        border: none;
                        color: white;
                        padding: 8px 12px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: 500;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        transition: all 0.2s ease;
                        box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
                    " onmouseover="this.style.background='linear-gradient(135deg, #357abd, #2968a3)'" 
                    onmouseout="this.style.background='linear-gradient(135deg, #4a90e2, #357abd)'">
                        👁️ View
                    </button>
                    
                    <button onclick="editFile(${index})" style="
                        background: linear-gradient(135deg, #50c878, #45b86b);
                        border: none;
                        color: white;
                        padding: 8px 12px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: 500;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        transition: all 0.2s ease;
                        box-shadow: 0 2px 8px rgba(80, 200, 120, 0.3);
                    " onmouseover="this.style.background='linear-gradient(135deg, #45b86b, #3da65f)'" 
                    onmouseout="this.style.background='linear-gradient(135deg, #50c878, #45b86b)'">
                        ✏️ Edit
                    </button>
                    
                    <button onclick="removeTag(${index})" style="
                        background: linear-gradient(135deg, #ff6b6b, #ee5a52);
                        border: none;
                        color: white;
                        padding: 8px 12px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: 500;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        transition: all 0.2s ease;
                        box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
                    " onmouseover="this.style.background='linear-gradient(135deg, #ee5a52, #e04848)'" 
                    onmouseout="this.style.background='linear-gradient(135deg, #ff6b6b, #ee5a52)'">
                        🗑️ Remove
                    </button>
                </div>
            </div>
        </div>
    `;
}

function createTagsTableRow(file, index) {
    const fileSize = formatFileSize(file.size);
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const fileIcon = getFileIcon(fileExtension, file.isPdf);
    
    return `
        <tr class="tagged-file-row" data-filename="${escapeHtml(file.name)}">
            <td>
                <div class="file-info">
                    <span class="file-icon">${fileIcon}</span>
                    <div>
                        <div class="file-name">${escapeHtml(file.name)}</div>
                        <div class="file-details">${fileExtension.toUpperCase()} File • ${file.tags.length} tag${file.tags.length !== 1 ? 's' : ''}</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="tag-list">
                    ${file.tags.map(tag => `
                        <span onclick="filterByTag('${escapeHtml(tag)}')" class="clickable-tag" 
                              title="Click to filter by this tag">${escapeHtml(tag)}</span>
                    `).join('')}
                </div>
            </td>
            <td>
                <span class="file-size">${fileSize}</span>
            </td>
            <td class="actions-cell">
                <div class="button-group">
                    <button onclick="viewFileByName('${escapeHtml(file.name)}')" class="view-btn">👁️ View</button>
                    <button onclick="editFileByName('${escapeHtml(file.name)}')" class="edit-btn">✏️ Edit</button>
                    <button onclick="removeTagFromFile('${escapeHtml(file.name)}')" class="delete-btn">🗑️ Delete</button>
                </div>
            </td>
        </tr>
    `;
}

// Create individual version control card
function createVersionControlCard(fileName, index) {
    const versions = fileVersions.get(fileName) || [];
    const latestVersion = versions[versions.length - 1];
    const versionCount = versions.length;
    const lastModified = latestVersion ? new Date(latestVersion.timestamp).toLocaleDateString() : 'N/A';
    
    return `
        <div class="file-container" style="
            background: linear-gradient(135deg, #2a2a2a, #3a3a3a);
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #444;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
        " onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 15px 45px rgba(0, 0, 0, 0.4)';" 
        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 32px rgba(0, 0, 0, 0.3)';">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="
                    background: linear-gradient(135deg, #9b59b6, #8e44ad);
                    width: 50px;
                    height: 50px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    color: white;
                    box-shadow: 0 4px 15px rgba(155, 89, 182, 0.3);
                ">
                    📄
                </div>
                
                <div style="flex: 1;">
                    <div style="
                        color: #ffffff;
                        font-size: 16px;
                        font-weight: 600;
                        margin-bottom: 8px;
                        word-break: break-word;
                    ">
                        ${fileName}
                    </div>
                    
                    <div style="
                        color: #cccccc;
                        font-size: 12px;
                        display: flex;
                        align-items: center;
                        gap: 15px;
                        margin-bottom: 5px;
                    ">
                        <span style="display: flex; align-items: center; gap: 5px;">
                            <div style="
                                background: linear-gradient(135deg, #3498db, #2980b9);
                                color: white;
                                padding: 2px 8px;
                                border-radius: 12px;
                                font-size: 10px;
                                font-weight: 600;
                                box-shadow: 0 2px 6px rgba(52, 152, 219, 0.3);
                            ">
                                📊 ${versionCount} version${versionCount !== 1 ? 's' : ''}
                            </div>
                        </span>
                        <span>📅 ${lastModified}</span>
                    </div>
                    
                    ${latestVersion ? `
                        <div style="
                            color: #aaa;
                            font-size: 11px;
                            font-style: italic;
                            margin-top: 5px;
                        ">
                            Last change: ${latestVersion.description || 'No description'}
                        </div>
                    ` : ''}
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button onclick="viewFileVersions('${fileName}')" style="
                        background: linear-gradient(135deg, #9b59b6, #8e44ad);
                        border: none;
                        color: white;
                        padding: 8px 12px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: 500;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        transition: all 0.2s ease;
                        box-shadow: 0 2px 8px rgba(155, 89, 182, 0.3);
                    " onmouseover="this.style.background='linear-gradient(135deg, #8e44ad, #7d3c98)'" 
                    onmouseout="this.style.background='linear-gradient(135deg, #9b59b6, #8e44ad)'">
                        🕒 History
                    </button>
                    
                    <button onclick="editFileByName('${fileName}')" style="
                        background: linear-gradient(135deg, #50c878, #45b86b);
                        border: none;
                        color: white;
                        padding: 8px 12px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: 500;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        transition: all 0.2s ease;
                        box-shadow: 0 2px 8px rgba(80, 200, 120, 0.3);
                    " onmouseover="this.style.background='linear-gradient(135deg, #45b86b, #3da65f)'" 
                    onmouseout="this.style.background='linear-gradient(135deg, #50c878, #45b86b)'">
                        ✏️ Edit
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Create individual version control table row
function createVersionControlRow(fileName, index) {
    const versions = getFileVersions(fileName);
    const latestVersion = versions[versions.length - 1];
    const file = uploadedFiles.find(f => f.name === fileName);
    
    if (!file || !latestVersion) return '';
    
    const fileSize = formatFileSize(file.size);
    const fileExtension = fileName.split('.').pop().toLowerCase();
    const fileIcon = getFileIcon(fileExtension, file.isPdf);
    const timeAgo = getTimeAgo(latestVersion.timestamp);
    
    return `
        <tr class="version-file-row" data-filename="${escapeHtml(fileName)}">
            <td>
                <div class="file-info">
                    <span class="file-icon">${fileIcon}</span>
                    <div>
                        <div class="file-name">${escapeHtml(fileName)}</div>
                        <div class="file-details">${fileExtension.toUpperCase()} File • ${fileSize}</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="version-info">
                    <span class="version-badge">v${latestVersion.version}</span>
                    <span class="version-count">${versions.length} version${versions.length !== 1 ? 's' : ''}</span>
                </div>
            </td>
            <td>
                <div class="modified-time">${timeAgo}</div>
                <div class="version-description">${latestVersion.description}</div>
            </td>
            <td class="actions-cell">
                <div class="button-group">
                    <button onclick="viewFileVersions('${escapeHtml(fileName)}')" class="history-btn">🕒 History</button>
                    <button onclick="editFileByName('${escapeHtml(fileName)}')" class="edit-btn">✏️ Edit</button>
                    <button onclick="deleteFileFromSystem('${escapeHtml(fileName)}')" class="delete-btn">🗑️ Delete</button>
                </div>
            </td>
        </tr>
    `;
}

// Display recent files (fallback for non-table view)
function displayRecentFiles() {
    setupRecentsTable();
}

// Update recent files display
function updateRecentFilesDisplay() {
    const recentSidebarActive = document.querySelector('.sidebar-item[data-section="recent"].active');
    if (recentSidebarActive) {
        displayRecentFiles();
    }
    updateRecentIndicator();
}

// Get time ago string
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'yesterday';
    return `${diffDays}d ago`;
}

// Initialize sidebar integration
function initializeSidebarIntegration() {
    // Add click listener to the existing Recent sidebar item
    const recentSidebarItem = document.querySelector('.sidebar-item[data-section="recent"]');
    if (recentSidebarItem) {
        recentSidebarItem.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update sidebar active states
            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.classList.remove('active');
            });
            recentSidebarItem.classList.add('active');
            
            // Transition to recent files view
            transitionToRecentsView();
        });
        
        // Add a visual indicator for recent files count
        updateRecentIndicator();
        setInterval(updateRecentIndicator, 2000);
    }
    
    // Setup Tags sidebar functionality
    const tagsSidebarItem = document.querySelector('.sidebar-item[data-section="tags"]');
    if (tagsSidebarItem) {
        tagsSidebarItem.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update sidebar active states
            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.classList.remove('active');
            });
            tagsSidebarItem.classList.add('active');
            
            // Transition to tags view
            transitionToTagsView();
        });
        
        // Add a visual indicator for tagged files count
        updateTagsIndicator();
        setInterval(updateTagsIndicator, 2000);
    }
    
    // Setup Version Control sidebar functionality
    const versionSidebarItem = document.querySelector('.sidebar-item[data-section="version"]');
    if (versionSidebarItem) {
        versionSidebarItem.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update sidebar active states
            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.classList.remove('active');
            });
            versionSidebarItem.classList.add('active');
            
            // Transition to version control view
            transitionToVersionControlView();
        });
        
        // Add a visual indicator for modified files count
        updateVersionControlIndicator();
        setInterval(updateVersionControlIndicator, 2000);
    }

    // Setup About sidebar functionality
    const aboutSidebarItem = document.querySelector('.sidebar-item[data-section="about"]');
    if (aboutSidebarItem) {
        aboutSidebarItem.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update sidebar active states
            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.classList.remove('active');
            });
            aboutSidebarItem.classList.add('active');
            
            // Transition to about view
            transitionToAboutView();
        });
    }
}

// Transition from home screen to recents view
function transitionToRecentsView() {
    const container1 = document.querySelector('.info-container:first-child');
    const container2 = document.getElementById('container2');
    const aboutView = document.getElementById('about-view');
    
    // Hide about view if it's currently visible
    if (aboutView && !aboutView.classList.contains('hidden')) {
        aboutView.style.transition = 'all 0.3s ease-in-out';
        aboutView.style.opacity = '0';
        aboutView.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            aboutView.classList.add('hidden');
            aboutView.style.display = 'none';
            
            // Reset card animations
            const cards = aboutView.querySelectorAll('.about-card');
            cards.forEach(card => {
                card.classList.remove('pop-in');
            });
        }, 300);
    }
    
    // Reset containers to ensure they're properly set up
    container1.style.display = 'block';
    container2.style.display = 'block';
    container1.style.opacity = '1';
    container1.style.transform = 'translateX(0)';
    
    // Add transition class to containers
    container1.style.transition = 'all 0.5s ease-in-out';
    container2.style.transition = 'all 0.5s ease-in-out';
    
    // Fade out container1 and transform container2
    container1.style.opacity = '0';
    container1.style.transform = 'translateX(-20px)';
    
    // Show and expand container2 to full width
    container2.classList.remove('hidden');
    body.classList.add('containers-expanded');
    
    setTimeout(() => {
        // Hide container1 completely and expand container2 to a reasonable size
        container1.style.display = 'none';
        container2.style.width = '80vw';
        container2.style.maxWidth = '1400px';
        container2.style.height = '80vh';
        container2.style.margin = '20px auto';
        container2.style.transform = 'translateX(0)';
        
        // Update container2 content after transition
        setupRecentsTable();
        
        // Add back button to return to home
        addBackToHomeButton();
        
    }, 250);
}

// Return to home screen from recents
function returnToHomeScreen() {
    // Prevent multiple executions
    if (returnToHomeScreen.isRunning) {
        return;
    }
    returnToHomeScreen.isRunning = true;
    
    // Hide universal back button
    hideUniversalBackButton();
    
    const container1 = document.querySelector('.info-container:first-child');
    const container2 = document.getElementById('container2');
    const aboutView = document.getElementById('about-view');
    
    if (!container1 || !container2) {
        returnToHomeScreen.isRunning = false;
        return;
    }

    // Hide about view if it's visible
    if (aboutView && !aboutView.classList.contains('hidden')) {
        aboutView.style.transition = 'all 0.3s ease-in-out';
        aboutView.style.opacity = '0';
        aboutView.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            aboutView.classList.add('hidden');
            aboutView.style.display = 'none';
            
            // Reset card animations
            const cards = aboutView.querySelectorAll('.about-card');
            cards.forEach(card => {
                card.classList.remove('pop-in');
            });
        }, 300);
    }
    
    // Force cleanup of any existing transitions
    container1.style.transition = 'none';
    container2.style.transition = 'none';
    
    // Force a reflow to apply the transition: none immediately
    container1.offsetHeight;
    container2.offsetHeight;
    
    // Now add smooth transitions
    container1.style.transition = 'all 0.4s ease-in-out';
    container2.style.transition = 'all 0.4s ease-in-out';
    
    // Start the transition
    container2.style.opacity = '0';
    container2.style.transform = 'scale(0.95) translateX(10px)';
    
    // Execute the main transition
    setTimeout(() => {
        // Clear all classes and styles
        container2.className = 'info-container';
        container2.id = 'container2';
        container2.classList.add('hidden');
        
        body.classList.remove('containers-expanded');
        
        // Restore original container2 content
        container2.innerHTML = `
            <div class="container-header">
                <h2>Referenced Files</h2>
            </div>
            <div class="container-content">
                <div style="
                    padding: 40px 20px;
                    text-align: center;
                    color: #888888;
                    font-style: italic;
                ">
                    📁 No files referenced yet.<br>
                    Files will appear here when the AI references them.
                </div>
            </div>
        `;
        
        // Reset all styles to default
        container2.style.cssText = '';
        container1.style.cssText = '';
        
        // Restore original container dimensions
        container2.style.width = '460px';
        container2.style.height = '520px';
        container2.style.margin = '';
        
        // Ensure container1 is visible and properly positioned
        container1.style.display = 'block';
        container1.style.opacity = '1';
        container1.style.transform = 'translateX(0)';
        
        // Clear sidebar selections
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Clear search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Reset the running flag
        setTimeout(() => {
            returnToHomeScreen.isRunning = false;
        }, 100);
        
    }, 200);
}

// Transition from home screen to tags view
function transitionToTagsView() {
    const container1 = document.querySelector('.info-container:first-child');
    const container2 = document.getElementById('container2');
    const aboutView = document.getElementById('about-view');
    
    // Hide about view if it's currently visible
    if (aboutView && !aboutView.classList.contains('hidden')) {
        aboutView.style.transition = 'all 0.3s ease-in-out';
        aboutView.style.opacity = '0';
        aboutView.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            aboutView.classList.add('hidden');
            aboutView.style.display = 'none';
            
            // Reset card animations
            const cards = aboutView.querySelectorAll('.about-card');
            cards.forEach(card => {
                card.classList.remove('pop-in');
            });
        }, 300);
    }
    
    // Reset containers to ensure they're properly set up
    container1.style.display = 'block';
    container2.style.display = 'block';
    container1.style.opacity = '1';
    container1.style.transform = 'translateX(0)';
    
    // Add transition class to containers
    container1.style.transition = 'all 0.5s ease-in-out';
    container2.style.transition = 'all 0.5s ease-in-out';
    
    // Fade out container1 and transform container2
    container1.style.opacity = '0';
    container1.style.transform = 'translateX(-20px)';
    
    // Show and expand container2 to full width
    container2.classList.remove('hidden');
    body.classList.add('containers-expanded');
    
    setTimeout(() => {
        // Hide container1 completely and expand container2 to a reasonable size
        container1.style.display = 'none';
        container2.style.width = '80vw';
        container2.style.maxWidth = '1400px';
        container2.style.height = '80vh';
        container2.style.margin = '20px auto';
        container2.style.transform = 'translateX(0)';
        
        // Update container2 content after transition
        setupTagsTable();
        
        // Add back button to return to home
        addBackToHomeButton();
        
    }, 250);
}

// Transition from home screen to version control view
function transitionToVersionControlView() {
    const container1 = document.querySelector('.info-container:first-child');
    const container2 = document.getElementById('container2');
    const aboutView = document.getElementById('about-view');
    
    // Hide about view if it's currently visible
    if (aboutView && !aboutView.classList.contains('hidden')) {
        aboutView.style.transition = 'all 0.3s ease-in-out';
        aboutView.style.opacity = '0';
        aboutView.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            aboutView.classList.add('hidden');
            aboutView.style.display = 'none';
            
            // Reset card animations
            const cards = aboutView.querySelectorAll('.about-card');
            cards.forEach(card => {
                card.classList.remove('pop-in');
            });
        }, 300);
    }
    
    // Reset containers to ensure they're properly set up
    container1.style.display = 'block';
    container2.style.display = 'block';
    container1.style.opacity = '1';
    container1.style.transform = 'translateX(0)';
    
    // Add transition class to containers
    container1.style.transition = 'all 0.5s ease-in-out';
    container2.style.transition = 'all 0.5s ease-in-out';
    
    // Fade out container1 and transform container2
    container1.style.opacity = '0';
    container1.style.transform = 'translateX(-20px)';
    
    // Show and expand container2 to full width
    container2.classList.remove('hidden');
    body.classList.add('containers-expanded');
    
    setTimeout(() => {
        // Hide container1 completely and expand container2 to a reasonable size
        container1.style.display = 'none';
        container2.style.width = '80vw';
        container2.style.maxWidth = '1400px';
        container2.style.height = '80vh';
        container2.style.margin = '20px auto';
        container2.style.transform = 'translateX(0)';
        
        // Update container2 content after transition
        setupVersionControlTable();
        
        // Add back button to return to home
        addBackToHomeButton();
        
    }, 250);
}

// Transition from home screen to about view
function transitionToAboutView() {
    const container1 = document.querySelector('.info-container:first-child');
    const container2 = document.getElementById('container2');
    const aboutView = document.getElementById('about-view');
    
    // Show universal back button
    showUniversalBackButton();
    
    // Add transition class to containers
    container1.style.transition = 'all 0.5s ease-in-out';
    container2.style.transition = 'all 0.5s ease-in-out';
    
    // Fade out container1 and container2
    container1.style.opacity = '0';
    container1.style.transform = 'translateX(-20px)';
    container2.classList.add('hidden');
    
    setTimeout(() => {
        // Hide containers
        container1.style.display = 'none';
        container2.style.display = 'none';
        
        // Show about view
        if (aboutView) {
            aboutView.classList.remove('hidden');
            aboutView.style.display = 'block';
            aboutView.style.opacity = '0';
            aboutView.style.transform = 'translateY(20px)';
            aboutView.style.transition = 'all 0.5s ease-in-out';
            
            // Animate in the about view
            setTimeout(() => {
                aboutView.style.opacity = '1';
                aboutView.style.transform = 'translateY(0)';
                
                // Animate the cards with staggered delay
                const cards = aboutView.querySelectorAll('.about-card');
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('pop-in');
                    }, index * 100);
                });
            }, 50);
        }
        
    }, 250);
}

// Update the recent files indicator in sidebar
function updateRecentIndicator() {
    const recentSidebarItem = document.querySelector('.sidebar-item[data-section="recent"]');
    if (recentSidebarItem && recentFiles.length > 0) {
        // Remove existing badge
        const existingBadge = recentSidebarItem.querySelector('.recent-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        // Add count badge
        const badge = document.createElement('span');
        badge.className = 'recent-badge';
        badge.style.cssText = `
            background: #007acc;
            color: white;
            border-radius: 10px;
            padding: 2px 6px;
            font-size: 11px;
            margin-left: 8px;
            font-weight: bold;
        `;
        badge.textContent = recentFiles.length;
        recentSidebarItem.appendChild(badge);
    } else if (recentSidebarItem) {
        // Remove badge if no recent files
        const existingBadge = recentSidebarItem.querySelector('.recent-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
    }
}

// Update the tags indicator in sidebar
function updateTagsIndicator() {
    const tagsSidebarItem = document.querySelector('.sidebar-item[data-section="tags"]');
    const taggedCount = getTaggedFilesCount();
    
    if (tagsSidebarItem && taggedCount > 0) {
        // Remove existing badge
        const existingBadge = tagsSidebarItem.querySelector('.tags-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        // Add count badge
        const badge = document.createElement('span');
        badge.className = 'tags-badge';
        badge.style.cssText = `
            background: #28a745;
            color: white;
            border-radius: 10px;
            padding: 2px 6px;
            font-size: 11px;
            margin-left: 8px;
            font-weight: bold;
        `;
        badge.textContent = taggedCount;
        tagsSidebarItem.appendChild(badge);
    } else if (tagsSidebarItem) {
        // Remove badge if no tagged files
        const existingBadge = tagsSidebarItem.querySelector('.tags-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
    }
}

// Update the version control indicator in sidebar
function updateVersionControlIndicator() {
    const versionControlItem = document.querySelector('.sidebar-item[data-section="version"]');
    const modifiedCount = getModifiedFilesCount();
    
    if (versionControlItem && modifiedCount > 0) {
        // Remove existing badge
        const existingBadge = versionControlItem.querySelector('.version-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        // Add count badge
        const badge = document.createElement('span');
        badge.className = 'version-badge';
        badge.style.cssText = `
            background: #dc3545;
            color: white;
            border-radius: 10px;
            padding: 2px 6px;
            font-size: 11px;
            margin-left: 8px;
            font-weight: bold;
        `;
        badge.textContent = modifiedCount;
        versionControlItem.appendChild(badge);
    } else if (versionControlItem) {
        // Remove badge if no modified files
        const existingBadge = versionControlItem.querySelector('.version-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Get file icon based on extension
function getFileIcon(extension, isPdf = false) {
    if (isPdf) return '📄';
    
    const iconMap = {
        'txt': '📝',
        'md': '📋',
        'py': '🐍',
        'js': '🟨',
        'html': '🌐',
        'css': '🎨',
        'json': '📊',
        'xml': '📰',
        'pdf': '📄',
        'doc': '📄',
        'docx': '📄'
    };
    
    return iconMap[extension] || '📄';
}

// Add back to home button functionality
function addBackToHomeButton() {
    // Remove any existing listeners first
    const existingBtn = document.getElementById('back-to-home');
    if (existingBtn) {
        existingBtn.removeEventListener('click', returnToHomeScreen);
    }
    
    // Use event delegation to handle clicks reliably
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'back-to-home') {
            e.preventDefault();
            e.stopPropagation();
            returnToHomeScreen();
        }
    });
}

// Open recent file (global function for table buttons)
function openRecentFile(fileName) {
    const file = recentFiles.find(f => f.name === fileName);
    if (file) {
        displayFileContentInContainer(file.name, file.content, [], file.searchQuery);
    }
}

function openTaggedFile(fileName) {
    const file = uploadedFiles.find(f => f.name === fileName);
    if (file) {
        displayFileContentInContainer(file.name, file.content, []);
    }
}

function openVersionControlFile(fileName) {
    const file = uploadedFiles.find(f => f.name === fileName);
    if (file) {
        displayFileContentInContainer(file.name, file.content, []);
    }
}

function viewFileVersions(fileName) {
    const versions = getFileVersions(fileName);
    if (versions.length === 0) return;
    
    // Close any existing version history overlay first
    const existingVersionOverlay = document.getElementById('version-history-overlay');
    if (existingVersionOverlay) {
        existingVersionOverlay.remove();
    }
    
    // Close any existing file overlays
    closeFileOverlay();
    
    // Create version history overlay
    const versionOverlay = document.createElement('div');
    versionOverlay.id = 'version-history-overlay';
    versionOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 1002;
        display: flex;
        flex-direction: column;
    `;
    
    versionOverlay.innerHTML = `
        <div class="version-header" style="
            padding: 20px 30px;
            border-bottom: 2px solid #444444;
            background-color: rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
            position: relative;
            z-index: 1003;
        ">
            <div>
                <h2 style="margin: 0; color: #ffffff; font-size: 22px;">📋 Version History: ${escapeHtml(fileName)}</h2>
                <p style="margin: 5px 0 0 0; color: #888; font-size: 14px;">${versions.length} version${versions.length !== 1 ? 's' : ''} available</p>
            </div>
            <button id="close-version-history" style="
                background: #d73a49; 
                color: white; 
                border: none; 
                padding: 8px 12px; 
                border-radius: 4px; 
                cursor: pointer;
                font-size: 12px;
                font-weight: bold;
                min-width: 32px;
                transition: all 0.2s ease;
                z-index: 1003;
                position: relative;
                pointer-events: auto;
            " onmouseover="this.style.background='#c82333'" 
               onmouseout="this.style.background='#d73a49'"
               onclick="console.log('Close clicked via onclick'); closeAllVersionHistories();">✕</button>
        </div>
        <div class="version-content" style="
            flex: 1;
            overflow-y: auto;
            padding: 20px;
        ">
            ${createVersionHistoryList(versions, fileName)}
        </div>
    `;
    
    document.body.appendChild(versionOverlay);
    
    // Add event listeners with delegation
    versionOverlay.addEventListener('click', (e) => {
        if (e.target.id === 'close-version-history') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Close button clicked'); // Debug log
            closeVersionHistory();
            return;
        }
        // Also allow clicking outside to close (on overlay background)
        if (e.target === versionOverlay) {
            closeVersionHistory();
        }
    });
    
    // Create close function
    function closeVersionHistory() {
        console.log('Closing version history'); // Debug log
        if (versionOverlay && versionOverlay.parentNode) {
            versionOverlay.remove();
        }
        // Also clean up any orphaned version history overlays
        const allVersionOverlays = document.querySelectorAll('#version-history-overlay');
        allVersionOverlays.forEach(overlay => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        });
        document.removeEventListener('keydown', handleEscapeKey);
    }
    
    // Handle Escape key
    const handleEscapeKey = (e) => {
        if (e.key === 'Escape') {
            closeVersionHistory();
        }
    };
    document.addEventListener('keydown', handleEscapeKey);
    
    // Store reference for global access if needed
    window.closeVersionHistory = closeVersionHistory;
}

function createVersionHistoryList(versions, fileName) {
    return `
        <div style="max-width: 800px; margin: 0 auto;">
            ${versions.slice().reverse().map((version, index) => `
                <div class="version-item" style="
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid #444;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 15px;
                    position: relative;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                        <div>
                            <h3 style="margin: 0; color: #ffffff; font-size: 16px;">
                                Version ${version.version}
                                ${index === 0 ? '<span style="background: #28a745; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 8px;">CURRENT</span>' : ''}
                            </h3>
                            <p style="margin: 5px 0 0 0; color: #888; font-size: 14px;">
                                ${version.timestamp.toLocaleString()} • ${formatFileSize(version.size)}
                            </p>
                        </div>
                        <button onclick="previewVersion('${escapeHtml(fileName)}', ${version.id})" style="
                            background: #007acc;
                            color: white;
                            border: none;
                            padding: 6px 12px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 12px;
                        ">👁️ Preview</button>
                    </div>
                    <p style="margin: 0; color: #ccc; font-size: 14px;">
                        <strong>Changes:</strong> ${escapeHtml(version.description)}
                    </p>
                </div>
            `).join('')}
        </div>
    `;
}

function previewVersion(fileName, versionId) {
    console.log(`Previewing version ${versionId} of ${fileName}`);
    const versions = getFileVersions(fileName);
    const version = versions.find(v => v.id === versionId);
    if (version) {
        // Hide the version history overlay temporarily (don't remove it)
        const versionHistoryOverlay = document.getElementById('version-history-overlay');
        if (versionHistoryOverlay) {
            versionHistoryOverlay.style.display = 'none';
        }
        
        // Display the version content with Back to History button
        displayFileContentInContainer(fileName, version.content, [], `Version ${version.version} Preview`, true);
    }
}

function filterByTag(tag) {
    const tagsFilterInput = document.getElementById('tags-filter-input');
    if (tagsFilterInput) {
        tagsFilterInput.value = tag;
        filterTaggedFiles(tag.toLowerCase());
        
        // Visual feedback for active filter
        tagsFilterInput.style.borderColor = '#28a745';
        tagsFilterInput.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
        
        const clearFilterBtn = document.getElementById('clear-tags-filter');
        if (clearFilterBtn) {
            clearFilterBtn.style.backgroundColor = '#28a745';
        }
    }
}

// Global function to close version history overlays
function closeAllVersionHistories() {
    const allVersionOverlays = document.querySelectorAll('#version-history-overlay');
    allVersionOverlays.forEach(overlay => {
        if (overlay.parentNode) {
            overlay.remove();
        }
    });
}

// Make functions globally accessible
window.openRecentFile = openRecentFile;
window.openTaggedFile = openTaggedFile;
window.openVersionControlFile = openVersionControlFile;
window.viewFileVersions = viewFileVersions;
window.closeAllVersionHistories = closeAllVersionHistories;
window.previewVersion = previewVersion;
window.filterByTag = filterByTag;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing systems...');
    
    // ===== USER AUTHENTICATION & UI LOGIC =====
    // Dropdown menu logic for Home.html user icon
    const userIcon = document.getElementById('userIcon');
    const userDropdown = document.getElementById('userDropdown');
    const logoutMenuItem = document.getElementById('logoutMenuItem');
    
    console.log('User elements found:', { userIcon, userDropdown, logoutMenuItem });
    
    if (userIcon && userDropdown) {
        console.log('Setting up user dropdown functionality');
        userIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            if (userDropdown && userDropdown.classList.contains('show')) {
                userDropdown.classList.remove('show');
                setTimeout(() => { 
                    if (userDropdown) userDropdown.style.display = 'none'; 
                }, 250);
            } else if (userDropdown) {
                userDropdown.style.display = 'block';
                setTimeout(() => { 
                    if (userDropdown) userDropdown.classList.add('show'); 
                }, 10);
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            if (userDropdown && userDropdown.classList.contains('show')) {
                userDropdown.classList.remove('show');
                setTimeout(() => { userDropdown.style.display = 'none'; }, 250);
            }
        });
    }
    
    // ===== SSO/OIDC AUTHENTICATION CONFIGURATION =====
    // Define SSO configuration first to avoid hoisting issues
    const ssoConfig = {
        enabled: true, // Set to true to enable SSO, false for manual login
        provider: 'oidc', // 'oidc', 'oauth2', 'azure', 'google', etc.
        endpoints: {
            authorize: 'https://login.microsoftonline.com/YOUR_TENANT_ID/oauth2/v2.0/authorize',
            token: 'https://login.microsoftonline.com/YOUR_TENANT_ID/oauth2/v2.0/token',
            userinfo: 'https://graph.microsoft.com/v1.0/me',
            logout: 'https://login.microsoftonline.com/YOUR_TENANT_ID/oauth2/v2.0/logout'
        },
        clientId: 'your-client-id', // Replace with your SSO client ID
        redirectUri: window.location.origin + '/index.html',
        scope: 'openid profile email',
        responseType: 'code'
    };
    
    // Logout handlers (after SSO config is defined)
    if (logoutMenuItem) {
        console.log('Setting up logout menu item');
        logoutMenuItem.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Logout menu item clicked');
            
            // Use SSO logout if enabled and tokens exist
            if (ssoConfig.enabled && localStorage.getItem('access_token')) {
                initiateSSOLogout();
            } else {
                // Fallback to manual logout
                localStorage.removeItem('currentUserID');
                localStorage.removeItem('sidebarAnimate');
                window.location.href = 'acelogin.html';
            }
        });
    }
    
    // Logout logic for Home.html
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            console.log('Logout button clicked');
            
            // Use SSO logout if enabled and tokens exist
            if (ssoConfig.enabled && localStorage.getItem('access_token')) {
                initiateSSOLogout();
            } else {
                // Fallback to manual logout
                localStorage.removeItem('currentUserID');
                localStorage.removeItem('sidebarAnimate');
                window.location.href = 'acelogin.html';
            }
        });
    }
    
    // SSO Authentication Functions
    function initiateSSOLogin() {
        console.log('Initiating SSO login...');
        
        // Generate state parameter for security
        const state = generateRandomString(32);
        localStorage.setItem('sso_state', state);
        
        // Build authorization URL
        const authParams = new URLSearchParams({
            client_id: ssoConfig.clientId,
            redirect_uri: ssoConfig.redirectUri,
            response_type: ssoConfig.responseType,
            scope: ssoConfig.scope,
            state: state
        });
        
        const authUrl = `${ssoConfig.endpoints.authorize}?${authParams.toString()}`;
        console.log('Redirecting to SSO provider:', authUrl);
        
        // Redirect to SSO provider
        window.location.href = authUrl;
    }
    
    function handleSSOCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        
        if (error) {
            console.error('SSO authentication error:', error);
            showLoginError('Authentication failed: ' + error);
            return false;
        }
        
        if (code && state) {
            const storedState = localStorage.getItem('sso_state');
            if (state !== storedState) {
                console.error('State mismatch in SSO callback');
                showLoginError('Authentication failed: Invalid state');
                return false;
            }
            
            console.log('SSO callback received, exchanging code for token...');
            exchangeCodeForToken(code);
            return true;
        }
        
        return false;
    }
    
    async function exchangeCodeForToken(authCode) {
        try {
            const tokenParams = new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: ssoConfig.clientId,
                code: authCode,
                redirect_uri: ssoConfig.redirectUri
            });
            
            const response = await fetch(ssoConfig.endpoints.token, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: tokenParams.toString()
            });
            
            if (!response.ok) {
                throw new Error(`Token exchange failed: ${response.status}`);
            }
            
            const tokenData = await response.json();
            console.log('Token exchange successful');
            
            // Store tokens
            localStorage.setItem('access_token', tokenData.access_token);
            if (tokenData.refresh_token) {
                localStorage.setItem('refresh_token', tokenData.refresh_token);
            }
            
            // Get user info
            await getUserInfo(tokenData.access_token);
            
        } catch (error) {
            console.error('Token exchange error:', error);
            showLoginError('Authentication failed: ' + error.message);
        }
    }
    
    async function getUserInfo(accessToken) {
        try {
            const response = await fetch(ssoConfig.endpoints.userinfo, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`User info request failed: ${response.status}`);
            }
            
            const userInfo = await response.json();
            console.log('User info retrieved:', userInfo);
            
            // Store user information
            const userID = userInfo.preferred_username || userInfo.sub || userInfo.email || 'Unknown User';
            localStorage.setItem('currentUserID', userID);
            localStorage.setItem('userEmail', userInfo.email || '');
            localStorage.setItem('userName', userInfo.name || userID);
            localStorage.setItem('sidebarAnimate', 'true');
            
            console.log('SSO authentication complete, user ID:', userID);
            
            // Clean up URL parameters and redirect
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
            
            // Reload to initialize with user data
            window.location.reload();
            
        } catch (error) {
            console.error('User info error:', error);
            showLoginError('Failed to get user information: ' + error.message);
        }
    }
    
    function generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    function showLoginError(message) {
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        } else {
            alert(message);
        }
    }
    
    function initiateSSOLogout() {
        const accessToken = localStorage.getItem('access_token');
        
        // Clear local storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('currentUserID');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('sidebarAnimate');
        localStorage.removeItem('sso_state');
        
        // Redirect to SSO logout if configured
        if (ssoConfig.endpoints.logout && accessToken) {
            const logoutUrl = `${ssoConfig.endpoints.logout}?redirect_uri=${encodeURIComponent(window.location.origin + '/acelogin.html')}`;
            window.location.href = logoutUrl;
        } else {
            window.location.href = 'acelogin.html';
        }
    }
    
    // Check for SSO callback on page load
    if (ssoConfig.enabled && handleSSOCallback()) {
        // SSO callback handled, don't set up manual login
        console.log('SSO callback processed');
    } else {
        // Set up manual login or SSO initiation
        setupLoginHandlers();
    }
    
    function setupLoginHandlers() {
        // Login logic for ACElogin.html
        const loginForm = document.querySelector('.login-form');
        const ssoLoginBtn = document.getElementById('sso-login-btn');
        
        console.log('Login form found:', loginForm);
        console.log('SSO login button found:', ssoLoginBtn);
        
        // SSO Login Button
        if (ssoLoginBtn && ssoConfig.enabled) {
            console.log('Setting up SSO login button');
            ssoLoginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                initiateSSOLogin();
            });
        }
        
        if (loginForm) {
            console.log('Attaching login form listener');
            loginForm.addEventListener('submit', function(e) {
                console.log('Login form submitted');
                e.preventDefault();
                
                // If SSO is enabled, redirect to SSO instead of manual login
                if (ssoConfig.enabled) {
                    initiateSSOLogin();
                    return;
                }
                
                // Manual login fallback
                const userIDElement = document.getElementById('userID');
                console.log('UserID element found:', userIDElement);
                
                if (!userIDElement) {
                    console.error('UserID input field not found!');
                    return;
                }
                
                const userID = userIDElement.value.trim();
                console.log('UserID value:', userID);
                
                const errorDiv = document.getElementById('login-error');
                console.log('Error div found:', errorDiv);
                
                if (userID.length > 0) {
                    console.log('UserID valid, proceeding with manual login');
                    if (errorDiv) {
                        errorDiv.style.display = 'none';
                    }
                    
                    // Store user ID in localStorage for display on main page
                    localStorage.setItem('currentUserID', userID);
                    localStorage.setItem('sidebarAnimate', 'true');
                    console.log('User ID stored:', userID);
                    console.log('Redirecting to index.html');
                    window.location.href = 'index.html';
                } else {
                    console.log('UserID empty, showing error');
                    if (errorDiv) {
                        errorDiv.textContent = 'UserID is required.';
                        errorDiv.style.display = 'block';
                    } else {
                        alert('UserID is required.');
                    }
                }
            });
        }
    }
    

    
    // Select all sidebar nav links and welcome message element
    const sidebarItems = document.querySelectorAll(".sidebar-item");
    const dashboardWelcome = document.querySelector(".dashboard-welcome");
    
    console.log('Sidebar elements found:', { sidebarItemsCount: sidebarItems.length, dashboardWelcome });
    
    // Animate sidebar items only if coming from login
    if (localStorage.getItem('sidebarAnimate') === 'true') {
        console.log('Animating sidebar items');
        if (sidebarItems && sidebarItems.length > 0) {
            sidebarItems.forEach((item, idx) => {
                if (item && item.classList) {
                    setTimeout(() => {
                        item.classList.add('fade-in');
                    }, idx * 300 + 400); // 300ms delay between each, 400ms initial delay
                } else {
                    console.warn('Invalid sidebar item at index', idx, item);
                }
            });
        } else {
            console.log('No sidebar items found for animation');
        }
        localStorage.removeItem('sidebarAnimate');
    }
    
    // Display user ID next to user icon (for main app page)
    const currentUserID = localStorage.getItem('currentUserID');
    console.log('Current user ID from storage:', currentUserID);
    
    if (currentUserID) {
        // Try to find user ID display element
        let userIDDisplay = document.getElementById('userIDDisplay') || 
                           document.querySelector('.user-id-display') ||
                           document.querySelector('.current-user');
        
        if (userIDDisplay) {
            console.log('Found user ID display element, updating with:', currentUserID);
            userIDDisplay.textContent = currentUserID;
        } else {
            // If no dedicated display element exists, try to create one or update existing elements
            const userIcon = document.getElementById('userIcon');
            if (userIcon) {
                // Try to find or create a user ID display near the user icon
                let userIDSpan = userIcon.querySelector('.user-id') || 
                               userIcon.parentNode.querySelector('.user-id');
                
                if (!userIDSpan) {
                    // Create a new span for the user ID
                    userIDSpan = document.createElement('span');
                    userIDSpan.className = 'user-id';
                    userIDSpan.style.cssText = `
                        margin-left: 8px;
                        color: #ffffff;
                        font-size: 14px;
                        font-weight: 500;
                    `;
                    
                    // Insert after the user icon
                    if (userIcon.parentNode) {
                        userIcon.parentNode.insertBefore(userIDSpan, userIcon.nextSibling);
                    }
                }
                
                userIDSpan.textContent = currentUserID;
                console.log('User ID display created/updated near user icon:', currentUserID);
            } else {
                console.log('User icon not found, cannot display user ID');
            }
        }
    } else {
        console.log('No user ID found in storage');
    }
    
    // ===== END USER AUTHENTICATION & UI LOGIC =====
    
    // Initialize chat system first (replaces file upload functionality)
    setupChatSystem();
    
    // Initialize existing systems
    initializeSidebarIntegration();
    initializeUniversalBackButton();
    
    // Load saved state first, then clear referenced files only if no active section
    setTimeout(() => {
        loadAppState();
        
        // Only clear referenced files if no sidebar section was restored
        const hasActiveSection = document.querySelector('.sidebar-item.active');
        if (!hasActiveSection) {
            clearReferencedFiles();
        }
    }, 100);
    
    // Ensure About view is hidden on page load
    const aboutView = document.getElementById('about-view');
    if (aboutView) {
        aboutView.classList.add('hidden');
        aboutView.style.display = 'none';
    }
});

// Also try to setup chat system immediately in case DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading
} else {
    // DOM is already loaded
    console.log('DOM already loaded, setting up chat system...');
    setupChatSystem();
    clearReferencedFiles(); // Initialize Container 2 content
}

// ===== SIDEBAR TABLE ACTION FUNCTIONS =====

// View file function for sidebar tables
function viewFile(index) {
    if (recentFiles[index]) {
        const file = recentFiles[index];
        openRecentFile(file.name);
    }
}

// Edit file function for sidebar tables
function editFile(index) {
    if (recentFiles[index]) {
        const file = recentFiles[index];
        editFileByName(file.name);
    }
}

// Tag file function for sidebar tables
function tagFile(index) {
    if (recentFiles[index]) {
        const file = recentFiles[index];
        const tags = prompt(`Enter tags for "${file.name}" (separated by commas):`);
        if (tags !== null) {
            const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
            if (tagArray.length > 0) {
                fileTags.set(file.name, tagArray);
                updateRecentFilesDisplay();
                updateTagsIndicator();
            }
        }
    }
}

// View file by name function
function viewFileByName(fileName) {
    // First try to find in uploadedFiles
    let file = uploadedFiles.find(f => f.name === fileName);
    
    if (file) {
        displayFileContentInContainer(file.name, file.content, []);
    } else {
        // If not found, try to fetch from backend (for AI-referenced files)
        fetch('http://localhost:5000/get_file_content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: fileName })
        })
        .then(res => res.json())
        .then(data => {
            if (data.content) {
                displayFileContentInContainer(fileName, data.content, [], "AI Referenced File");
            } else {
                alert('Could not load file content.');
            }
        })
        .catch(error => {
            console.error('Error fetching file:', error);
            alert('Error loading file: ' + error.message);
        });
    }
}

// Edit file by name function
function editFileByName(fileName) {
    // First try to find in uploadedFiles
    let file = uploadedFiles.find(f => f.name === fileName);
    
    if (file) {
        openFileEditor(file.name, file.content);
    } else {
        // If not found, try to fetch from backend (for AI-referenced files)
        fetch('http://localhost:5000/get_file_content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: fileName })
        })
        .then(res => res.json())
        .then(data => {
            if (data.content) {
                openFileEditor(fileName, data.content);
            } else {
                alert('Could not load file for editing.');
            }
        })
        .catch(error => {
            console.error('Error fetching file for editing:', error);
            alert('Error loading file for editing: ' + error.message);
        });
    }
}

// Remove tag function for tagged files (by index)
function removeTag(index) {
    const taggedFiles = getAllTaggedFiles();
    if (taggedFiles[index]) {
        const fileName = taggedFiles[index].name;
        if (confirm(`Remove all tags from "${fileName}"?`)) {
            fileTags.delete(fileName);
            updateTagsIndicator();
            // Refresh the current view
            const activeSection = document.querySelector('.sidebar-item.active');
            if (activeSection && activeSection.getAttribute('data-section') === 'tags') {
                setupTagsTable();
            }
        }
    }
}

// Remove tag function for tagged files (by filename)
function removeTagFromFile(fileName) {
    if (confirm(`Remove all tags from "${fileName}"?`)) {
        fileTags.delete(fileName);
        updateTagsIndicator();
        // Refresh the current view
        const activeSection = document.querySelector('.sidebar-item.active');
        if (activeSection && activeSection.getAttribute('data-section') === 'tags') {
            setupTagsTable();
        }
    }
}

// Delete file from recent files
function deleteRecentFile(index) {
    if (recentFiles[index]) {
        const fileName = recentFiles[index].name;
        if (confirm(`Remove "${fileName}" from recent files?`)) {
            recentFiles.splice(index, 1);
            updateRecentFilesDisplay();
            updateRecentIndicator();
        }
    }
}

// Delete file from entire system (uploaded files, tags, versions, recent files)
function deleteFileFromSystem(fileName) {
    if (confirm(`Permanently delete "${fileName}" and all its data (tags, versions, history)?`)) {
        // Remove from uploaded files
        const fileIndex = uploadedFiles.findIndex(f => f.name === fileName);
        if (fileIndex >= 0) {
            uploadedFiles.splice(fileIndex, 1);
        }
        
        // Remove from recent files
        const recentIndex = recentFiles.findIndex(f => f.name === fileName);
        if (recentIndex >= 0) {
            recentFiles.splice(recentIndex, 1);
        }
        
        // Remove tags
        fileTags.delete(fileName);
        
        // Remove versions
        fileVersions.delete(fileName);
        modifiedFiles.delete(fileName);
        
        // Update all displays and indicators
        updateRecentFilesDisplay();
        updateRecentIndicator();
        updateTagsIndicator();
        updateVersionControlIndicator();
        
        // Persist state after file deletion
        persistState();
        
        // Refresh current view if needed
        const activeSection = document.querySelector('.sidebar-item.active');
        if (activeSection) {
            const section = activeSection.getAttribute('data-section');
            if (section === 'recent') {
                setupRecentsTable();
            } else if (section === 'tags') {
                setupTagsTable();
            } else if (section === 'version-control') {
                setupVersionControlTable();
            }
        }
    }
}

// ===== END LOCAL FILE SEARCH SYSTEM =====

