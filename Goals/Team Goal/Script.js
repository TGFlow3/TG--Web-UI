// Example: Fetch and display files from the 'octocat/Hello-World' public GitHub repo

document.addEventListener("DOMContentLoaded", () => {
  // Removed automatic GitHub file fetch on page load
    // Dropdown menu logic for Home.html user icon
    const userIcon = document.getElementById('userIcon');
    const userDropdown = document.getElementById('userDropdown');
    const logoutMenuItem = document.getElementById('logoutMenuItem');
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
        // Call this function when you want to display the files (e.g., after clicking a tab or search)
        // fetchGitHubRepoFiles();

        // Make sure you have an element with id 'github-file-list' in your HTML to display the results
        // Example: <ul id="github-file-list"></ul>
        document.addEventListener('click', function(e) {
          if (userDropdown.classList.contains('show')) {
            userDropdown.classList.remove('show');
            setTimeout(() => { userDropdown.style.display = 'none'; }, 250);
          }
        });
    }
    if (logoutMenuItem) {
      logoutMenuItem.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'Acelogin.html';
      });
    }
      // Login logic for ACElogin.html
      const loginForm = document.querySelector('.login-form');
      if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
          e.preventDefault();
          const userID = document.getElementById('userID').value.trim();
          const errorDiv = document.getElementById('login-error');
          if (userID.length > 0) {
            errorDiv.style.display = 'none';
            localStorage.setItem('sidebarAnimate', 'true');
            window.location.href = 'Home.html';
          } else {
            errorDiv.textContent = 'UserID is required.';
            errorDiv.style.display = 'block';
          }
        });
      }
  
      // Logout logic for Home.html
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
          window.location.href = 'ACElogin.html';
        });
      }
    // Select all sidebar nav links and welcome message element
      const sidebarItems = document.querySelectorAll(".sidebar-item");
      const dashboardWelcome = document.querySelector(".dashboard-welcome");
        
      // Animate sidebar items only if coming from login
      if (localStorage.getItem('sidebarAnimate') === 'true') {
        sidebarItems.forEach((item, idx) => {
          setTimeout(() => {
            item.classList.add('fade-in');
          }, idx * 300 + 400); // 300ms delay between each, 400ms initial delay
        });
        localStorage.removeItem('sidebarAnimate');
      }
  

    // Centralized view toggling logic
    const viewIds = [
      "recent-view",
      "tag-view",
      "version-control-view",
      "about-view"
    ];
    const views = {};
    viewIds.forEach(id => {
      views[id] = document.getElementById(id);
    });

    // Hide all content views
    function hideAllViews() {
      Object.values(views).forEach(view => {
        if (view) {
          view.classList.add("hidden");
          view.style.display = "none";
        }
      });
    }

    // Show only the selected view
    function showView(viewId) {
      hideAllViews();
      const view = views[viewId];
      if (view) {
        view.classList.remove("hidden");
        view.style.display = "block";
      }
    }

    // Set the clicked link as active and remove 'active' from others
    function setActiveLink(targetLink) {
      sidebarItems.forEach(item => item.classList.remove("active"));
      targetLink.classList.add("active");
    }
  
    // Sidebar toggle logic for mobile
    // select hamburger menu button and the sidebar
    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".sidebar");
  
    // Insert back button above Recent Documents tab
    let backBtn = document.getElementById('recent-back-btn');
    if (!backBtn && sidebar) {
      backBtn = document.createElement('button');
      backBtn.id = 'recent-back-btn';
      backBtn.textContent = '← Back to Home';
      backBtn.style.cssText = 'display:none;margin:1.5em 0 0 0.5em;padding:0.5em 1em;border:none;background:#294572;color:#fff;border-radius:4px;cursor:pointer;font-size:1em;';
      sidebar.insertBefore(backBtn, sidebar.firstChild);
    }

    function showRecentBackBtn(show) {
      if (backBtn) backBtn.style.display = show ? '' : 'none';
    }

    if (menuToggle && sidebar) {
      menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("show-sidebar");
      });
    }
  
    //======Handle events for navigation======
    sidebarItems.forEach((item) => {
      item.addEventListener("click", (event) => {
        // event.preventDefault();
        const linkText = item.textContent.trim();
        // Map tab text to view id
        let viewId = null;
  if (linkText === "Recent") viewId = "recent-view";
  else if (linkText === "Tags") viewId = "tag-view";
  else if (linkText === "Version Control") viewId = "version-control-view";
  else if (linkText === "About") viewId = "about-view";

        // if on mobile screen, close sidebar after a link is clicked
        if (sidebar.classList.contains("show-sidebar")) {
          sidebar.classList.remove("show-sidebar");
        }

        setActiveLink(item);
        if (viewId) {
          showView(viewId);
          // Update the header text
      const view = document.getElementById(viewId);
      showRecentBackBtn(true); // <-- Always show back button for any tab
        }

        // Hide welcome message when the About link is clicked
        if (linkText === "About") {
          dashboardWelcome.classList.add("hidden");
          animateAboutCards();
        } else {
          dashboardWelcome.classList.remove("hidden");
        }
      });
    });

    // Pop-in animation for about cards
    function animateAboutCards() {
      const cards = document.querySelectorAll('.about-card');
      // Remove pop-in class to reset animation
      cards.forEach(card => card.classList.remove('pop-in'));
      // Re-add pop-in class with delay for each card
      cards.forEach((card, i) => {
        setTimeout(() => {
          card.classList.add('pop-in');
        }, i * 350);
      });
    }

    // Show alert when document link is clicked
    const documentLinks = document.querySelectorAll('.document-link');
    documentLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Document can\'t be open.');
      });
    });

      // --- GitHub Repo Search Logic ---
      const searchBar = document.getElementById('search-bar'); // Make sure your search bar has this id
      const fileList = document.getElementById('github-file-list'); // Make sure you have this element to show results

      // Hide document view by default
      const documentsView = document.getElementById('recent-documents-view');
      if (documentsView) {
        documentsView.style.display = 'none';
      }

      async function fetchGitHubRepoFiles(query) {
        const repo = 'tralyonh4/TG--Web-UI';
        const apiUrl = `https://api.github.com/repos/${repo}/git/trees/main?recursive=1`;
        const documentsView = document.getElementById('recent-documents-view');
        if (documentsView) {
          documentsView.style.display = 'block';
        }
        try {
          const response = await fetch(apiUrl);
          const data = await response.json();
          let resultsHtml = '';
          if (!data.tree) {
            resultsHtml = '<li>No files found or API limit reached.</li>';
          } else {
            // Filter files by query
            const files = data.tree.filter(item => item.type === 'blob' && item.path.toLowerCase().includes(query.toLowerCase()));
            if (files.length === 0) {
              resultsHtml = '<li>No matching files found.</li>';
            } else {
              resultsHtml = files.map(file => `<li><a href="#" data-path="${file.path}">${file.path}</a></li>`).join('');
            }
          }
          // Display results in documents view layout
          if (documentsView) {
            documentsView.innerHTML = `<div class="document-view-section"><div class="document-view-header"><h2>Search Results</h2></div><div class="document-list-container"><ul id="github-file-list">${resultsHtml}</ul></div></div>`;
          }
        } catch (error) {
          if (documentsView) {
            documentsView.innerHTML = `<div class="document-view-section"><div class="document-view-header"><h2>Search Results</h2></div><div class="document-list-container"><ul id="github-file-list"><li>Error fetching files: ${error.message}</li></ul></div></div>`;
          }
        }
      }

      if (searchBar && fileList) {
        // Make lastSearchQuery global so all handlers can access it
        window.lastSearchQuery = '';
        searchBar.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            const query = searchBar.value;
            if (query.length > 1) {
              window.lastSearchQuery = query;
              // Hide all tab views before showing search results
              if (typeof hideAllViews === 'function') hideAllViews();
              const documentsView = document.getElementById('recent-documents-view');
              if (documentsView) documentsView.style.display = 'block';
              fetchGitHubRepoFiles(query);
              searchBar.value = '';
            }
          }
        });
        // Use global click event for links with data-path
        document.addEventListener('click', async (e) => {
          const target = e.target.closest('a[data-path]');
          if (!target) return;
          e.preventDefault();
          const filePath = target.getAttribute('data-path');
          const repo = 'tralyonh4/TG--Web-UI';
          const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;
          const documentsView = document.getElementById('recent-documents-view');
          if (documentsView) {
            documentsView.style.display = 'block';
          }
          try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            let contentHtml = '';
            if (data.type === 'file') {
              // Handle PDF and DOCX files
              if (data.encoding === 'base64' && data.content && data.name.match(/\.(pdf|docx)$/i)) {
                let mimeType = data.name.match(/\.pdf$/i) ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                contentHtml = `<iframe src="data:${mimeType};base64,${data.content}" style="width:100%;height:600px;border:none;"></iframe>`;
              } else if (data.encoding === 'base64' && data.content && data.name.match(/\.(jpg|jpeg|png|gif|bmp)$/i)) {
                contentHtml = `<img src="data:${data._links.self.includes('.svg') ? 'image/svg+xml' : 'image/*'};base64,${data.content}" alt="${data.name}" style="max-width:100%;height:auto;" />`;
              } else if (data.encoding === 'base64' && data.content) {
                // Decode base64 for text/code/markdown
                const decoded = atob(data.content.replace(/\n/g, ''));
                if (data.name.match(/\.md$/i)) {
                  // Simple markdown rendering
                  contentHtml = `<pre style="white-space:pre-wrap;">${decoded}</pre>`;
                } else if (data.name.match(/\.(js|py|css|html|json|ts)$/i)) {
                  contentHtml = `<pre style="background:#f4f4f4;padding:1em;border-radius:6px;overflow-x:auto;">${decoded}</pre>`;
                } else {
                  contentHtml = `<pre style="white-space:pre-wrap;">${decoded}</pre>`;
                }
              } else {
                contentHtml = '<div>Unable to display file content.</div>';
              }
            } else {
              contentHtml = '<div>Unable to retrieve file.</div>';
            }
            // Show content in documents view with back button and Full Screen button
            documentsView.innerHTML = `<div class="document-view-section"><div class="document-view-header" style="display:flex;align-items:center;gap:0.75em;"><button id="back-to-results" style="margin-bottom:1em;padding:0.5em 1em;border:none;background:#294572;color:#fff;border-radius:4px;cursor:pointer;">&larr; Back to Results</button><button id="fullscreen-toggle" style="margin-bottom:1em;padding:0.5em 1em;border:none;background:#32486b;color:#fff;border-radius:4px;cursor:pointer;">Full Screen</button><h2 style="flex:1;text-align:center;margin:0;">${data.name}</h2></div><div class="document-list-container"><div class="document-list" style="max-height:500px;overflow:auto;padding:1em;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.05);margin:1em 0;">${contentHtml}</div></div></div>`;
            // Always re-attach back button and fullscreen button event after rendering
            setTimeout(() => {
              const backBtn = document.getElementById('back-to-results');
              if (backBtn) {
                backBtn.onclick = () => {
                  // Always use the global lastSearchQuery
                  if (window.lastSearchQuery && window.lastSearchQuery.length > 0) {
                    fetchGitHubRepoFiles(window.lastSearchQuery);
                  } else {
                    // Fallback: show a message or clear the view
                    documentsView.innerHTML = '<div class="document-view-section"><div class="document-view-header"><h2>Search Results</h2></div><div class="document-list-container"><ul><li>No previous search to return to.</li></ul></div></div>';
                  }
                };
              }
              // Full Screen toggle logic
              const fullscreenBtn = document.getElementById('fullscreen-toggle');
              const docSection = documentsView.querySelector('.document-view-section');
              if (fullscreenBtn && docSection) {
                fullscreenBtn.onclick = () => {
                  docSection.classList.toggle('fullscreen-file-view');
                  fullscreenBtn.textContent = docSection.classList.contains('fullscreen-file-view') ? 'Exit Full Screen' : 'Full Screen';
                };
              }
            }, 50);
          } catch (error) {
            documentsView.innerHTML = `<div>Error loading file: ${error.message}</div>`;
          }
        });
      }

      // Helper: Add file to recent files
      function addToRecentFiles(file) {
        let recentFiles = JSON.parse(localStorage.getItem('recentFiles') || '[]');
        // Remove if already exists
        recentFiles = recentFiles.filter(f => f.path !== file.path);
        // Add to front
        recentFiles.unshift(file);
        // Limit to 10 recent files
        recentFiles = recentFiles.slice(0, 10);
        localStorage.setItem('recentFiles', JSON.stringify(recentFiles));
      }

      // Helper: Render recent files list
      function renderRecentFiles() {
        // (render logic removed)
      }

      // Show recent files when Recent Documents tab is clicked
      const recentTab = document.querySelector('.sidebar-item:nth-child(1)');
      if (recentTab) {
        recentTab.addEventListener('click', () => {
          renderRecentFiles();
          showRecentBackBtn(true);
        });
      }

      // Back button returns to home (dashboard welcome)
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          hideAllViews();
          // Hide recent documents view explicitly
          const recentView = document.getElementById('recent-view');
          if (recentView) {
            recentView.style.display = 'none';
          }
          // Show dashboard welcome
          if (dashboardWelcome) dashboardWelcome.classList.remove('hidden');
          // Show search bar
          const searchBarContainer = document.getElementById('search-bar')?.parentElement;
          if (searchBarContainer) searchBarContainer.style.display = '';
          // Show sidebar tabs (sidebar is always visible, but ensure items are visible)
          sidebarItems.forEach((item) => item.style.display = '');
          showRecentBackBtn(false);
          // Remove active state from sidebar items
          sidebarItems.forEach((item) => item.classList.remove('active'));
        });
      }
  
      // Open recent file when clicked
      document.addEventListener('click', async (e) => {
        const target = e.target.closest('a.recent-file-link');
        if (!target) return;
        e.preventDefault();
        const filePath = target.getAttribute('data-path');
        const repo = 'tralyonh4/TG--Web-UI';
        const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;
        const documentsView = document.getElementById('recent-view');
        if (documentsView) {
          documentsView.style.display = 'block';
        }
        try {
          const response = await fetch(apiUrl);
          const data = await response.json();
          let contentHtml = '';
          if (data.type === 'file') {
            // PDF/DOCX
            if (data.encoding === 'base64' && data.content && data.name.match(/\.(pdf|docx)$/i)) {
              let mimeType = data.name.match(/\.pdf$/i) ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
              contentHtml = `<iframe src="data:${mimeType};base64,${data.content}" style="width:100%;height:600px;border:none;"></iframe>`;
            } else if (data.encoding === 'base64' && data.content && data.name.match(/\.(jpg|jpeg|png|gif|bmp)$/i)) {
              contentHtml = `<img src="data:${data._links.self.includes('.svg') ? 'image/svg+xml' : 'image/*'};base64,${data.content}" alt="${data.name}" style="max-width:100%;height:auto;" />`;
            } else if (data.encoding === 'base64' && data.content) {
              const decoded = atob(data.content.replace(/\n/g, ''));
              if (data.name.match(/\.md$/i)) {
                contentHtml = `<pre style="white-space:pre-wrap;">${decoded}</pre>`;
              } else if (data.name.match(/\.(js|py|css|html|json|ts)$/i)) {
                contentHtml = `<pre style="background:#f4f4f4;padding:1em;border-radius:6px;overflow-x:auto;">${decoded}</pre>`;
              } else {
                contentHtml = `<pre style="white-space:pre-wrap;">${decoded}</pre>`;
              }
            } else {
              contentHtml = '<div>Unable to display file content.</div>';
            }
          } else {
            contentHtml = '<div>Unable to retrieve file.</div>';
          }
          documentsView.innerHTML = `<div class="document-view-section"><div class="document-view-header"><button id="back-to-recent" style="margin-bottom:1em;padding:0.5em 1em;border:none;background:#294572;color:#fff;border-radius:4px;cursor:pointer;">&larr; Back to Recent</button><h2>${data.name}</h2></div><div class="document-list-container"><div class="document-list" style="max-height:500px;overflow:auto;padding:1em;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.05);margin:1em 0;">${contentHtml}</div></div></div>`;
          documentsView.innerHTML = `<div class="document-view-section"><div class="document-view-header" style="display:flex;align-items:center;gap:0.75em;"><button id="back-to-recent" style="margin-bottom:1em;padding:0.5em 1em;border:none;background:#294572;color:#fff;border-radius:4px;cursor:pointer;">&larr; Back to Recent</button><button id="fullscreen-toggle" style="margin-bottom:1em;padding:0.5em 1em;border:none;background:#32486b;color:#fff;border-radius:4px;cursor:pointer;">Full Screen</button><h2 style="flex:1;text-align:center;margin:0;">${data.name}</h2></div><div class="document-list-container"><div class="document-list" style="max-height:500px;overflow:auto;padding:1em;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.05);margin:1em 0;">${contentHtml}</div></div></div>`;
          setTimeout(() => {
            const backBtn = document.getElementById('back-to-recent');
            if (backBtn) {
              backBtn.onclick = () => {
                renderRecentFiles();
                showRecentBackBtn(true);
              };
            }
            // Full Screen toggle logic
            const fullscreenBtn = document.getElementById('fullscreen-toggle');
            const docSection = documentsView.querySelector('.document-view-section');
            if (fullscreenBtn && docSection) {
              fullscreenBtn.onclick = () => {
                docSection.classList.toggle('fullscreen-file-view');
                fullscreenBtn.textContent = docSection.classList.contains('fullscreen-file-view') ? 'Exit Full Screen' : 'Full Screen';
              };
            }
          }, 50);
        } catch (error) {
          documentsView.innerHTML = `<div>Error loading file: ${error.message}</div>`;
        }
      });

      // Add to recent files when a file is opened from search
      document.addEventListener('click', (e) => {
        const target = e.target.closest('a[data-path]');
        if (!target || target.classList.contains('recent-file-link')) return;
        const fileName = target.textContent;
        const filePath = target.getAttribute('data-path');
        addToRecentFiles({ name: fileName, path: filePath });
        // If user opens a file from search, hide back button (not in Recent tab)
        showRecentBackBtn(false);
      });

      // Helper: Check if file is editable
      function isEditableFileType(filename) {
        return /\.(js|py|css|html|json|ts|md|txt)$/i.test(filename);
      }

      // Helper: Save file to GitHub using backend
      async function saveFileToGitHub(path, content, sha) {
        const response = await fetch('http://localhost:3000/api/save-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path,
            content,
            sha,
            message: 'Edit file via web app'
          })
        });
        const result = await response.json();
        if (result.success) {
          alert('File saved!');
        } else {
          alert('Error saving file: ' + (result.error && result.error.message));
        }
        return result;
      }

      // Update file open logic to support editing
      document.addEventListener('click', async (e) => {
        const target = e.target.closest('a[data-path]');
        if (!target || target.classList.contains('recent-file-link')) return;
        e.preventDefault();
        const fileName = target.textContent;
        const filePath = target.getAttribute('data-path');
        const repo = 'tralyonh4/TG--Web-UI';
        const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;
        const documentsView = document.getElementById('recent-documents-view');
        if (documentsView) {
          documentsView.style.display = 'block';
        }
        let latestSha = null;
        // Always fetch latest SHA before editing
        async function renderEditor() {
          try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            latestSha = data.sha;
            let contentHtml = '';
            if (data.type === 'file') {
              if (isEditableFileType(data.name) && data.encoding === 'base64' && data.content) {
                const decoded = atob(data.content.replace(/\n/g, ''));
                contentHtml = `<textarea id="file-editor" style="width:100%;height:400px;">${decoded}</textarea><br><button id="save-file-btn" style="margin-top:1em;padding:0.5em 1em;border:none;background:#294572;color:#fff;border-radius:4px;cursor:pointer;">Save</button>`;
              } else if (data.encoding === 'base64' && data.content && data.name.match(/\.(pdf|docx)$/i)) {
                let mimeType = data.name.match(/\.pdf$/i) ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                contentHtml = `<iframe src="data:${mimeType};base64,${data.content}" style="width:100%;height:600px;border:none;"></iframe>`;
              } else if (data.encoding === 'base64' && data.content && data.name.match(/\.(jpg|jpeg|png|gif|bmp)$/i)) {
                contentHtml = `<img src="data:${data._links.self.includes('.svg') ? 'image/svg+xml' : 'image/*'};base64,${data.content}" alt="${data.name}" style="max-width:100%;height:auto;" />`;
              } else if (data.encoding === 'base64' && data.content) {
                const decoded = atob(data.content.replace(/\n/g, ''));
                contentHtml = `<pre style="white-space:pre-wrap;">${decoded}</pre>`;
              } else {
                contentHtml = '<div>Unable to display file content.</div>';
              }
            } else {
              contentHtml = '<div>Unable to retrieve file.</div>';
            }
            documentsView.innerHTML = `<div class="document-view-section"><div class="document-view-header"><button id="back-to-results" style="margin-bottom:1em;padding:0.5em 1em;border:none;background:#294572;color:#fff;border-radius:4px;cursor:pointer;">&larr; Back to Results</button><h2>${data.name}</h2></div><div class="document-list-container"><div class="document-list" style="max-height:500px;overflow:auto;padding:1em;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.05);margin:1em 0;">${contentHtml}</div></div></div>`;
            documentsView.innerHTML = `<div class="document-view-section"><div class="document-view-header" style="display:flex;align-items:center;gap:0.75em;"><button id="back-to-results" style="margin-bottom:1em;padding:0.5em 1em;border:none;background:#294572;color:#fff;border-radius:4px;cursor:pointer;">&larr; Back to Results</button><button id="fullscreen-toggle" style="margin-bottom:1em;padding:0.5em 1em;border:none;background:#32486b;color:#fff;border-radius:4px;cursor:pointer;">Full Screen</button><h2 style="flex:1;text-align:center;margin:0;">${data.name}</h2></div><div class="document-list-container"><div class="document-list" style="max-height:500px;overflow:auto;padding:1em;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.05);margin:1em 0;">${contentHtml}</div></div></div>`;
            setTimeout(() => {
              const saveBtn = document.getElementById('save-file-btn');
              if (saveBtn) {
                saveBtn.onclick = async () => {
                  saveBtn.disabled = true;
                  const newContent = document.getElementById('file-editor').value;
                  // Use the helper function to save the file
                  const result = await saveFileToGitHub(filePath, newContent, latestSha);
                  // If the backend returns a new SHA, update latestSha
                  if (result && result.success && result.newSha) {
                    latestSha = result.newSha;
                  } else if (result && result.success && result.content && result.content.sha) {
                    latestSha = result.content.sha;
                  }
                  // Keep editor content as user's latest edit
                  document.getElementById('file-editor').value = newContent;
                  saveBtn.disabled = false;
                };
              }
              const backBtn = document.getElementById('back-to-results');
              if (backBtn) {
                backBtn.onclick = () => {
                  if (lastSearchQuery) fetchGitHubRepoFiles(lastSearchQuery);
                };
              }
              // Full Screen toggle logic
              const fullscreenBtn = document.getElementById('fullscreen-toggle');
              const docSection = documentsView.querySelector('.document-view-section');
              if (fullscreenBtn && docSection) {
                fullscreenBtn.onclick = () => {
                  docSection.classList.toggle('fullscreen-file-view');
                  fullscreenBtn.textContent = docSection.classList.contains('fullscreen-file-view') ? 'Exit Full Screen' : 'Full Screen';
                };
              }
            }, 50);
          } catch (error) {
            documentsView.innerHTML = `<div>Error loading file: ${error.message}</div>`;
          }
        }
        // Initial render
        renderEditor();
      });
  
      
  
      // Helper: Render tagged documents list
  
      // Open tagged document when clicked
      document.addEventListener('click', async (e) => {
        const target = e.target.closest('a.tagged-file-link');
        if (!target) return;
        e.preventDefault();
        const filePath = target.getAttribute('data-path');
        const repo = 'tralyonh4/TG--Web-UI';
        const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;
        const documentsView = document.getElementById('tag-view');
        if (documentsView) {
          documentsView.style.display = 'block';
        }
        try {
          const response = await fetch(apiUrl);
          const data = await response.json();
          let contentHtml = '';
          if (data.type === 'file') {
            // PDF/DOCX
            if (data.encoding === 'base64' && data.content && data.name.match(/\.(pdf|docx)$/i)) {
              let mimeType = data.name.match(/\.pdf$/i) ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
              contentHtml = `<iframe src="data:${mimeType};base64,${data.content}" style="width:100%;height:600px;border:none;"></iframe>`;
            } else if (data.encoding === 'base64' && data.content && data.name.match(/\.(jpg|jpeg|png|gif|bmp)$/i)) {
              contentHtml = `<img src="data:${data._links.self.includes('.svg') ? 'image/svg+xml' : 'image/*'};base64,${data.content}" alt="${data.name}" style="max-width:100%;height:auto;" />`;
            } else if (data.encoding === 'base64' && data.content) {
              const decoded = atob(data.content.replace(/\n/g, ''));
              if (data.name.match(/\.md$/i)) {
                contentHtml = `<pre style="white-space:pre-wrap;">${decoded}</pre>`;
              } else if (data.name.match(/\.(js|py|css|html|json|ts)$/i)) {
                contentHtml = `<pre style="background:#f4f4f4;padding:1em;border-radius:6px;overflow-x:auto;">${decoded}</pre>`;
              } else {
                contentHtml = `<pre style="white-space:pre-wrap;">${decoded}</pre>`;
              }
            } else {
              contentHtml = '<div>Unable to display file content.</div>';
            }
          } else {
            contentHtml = '<div>Unable to retrieve file.</div>';
          }
          documentsView.innerHTML = `<div class="document-view-section"><div class="document-view-header"><button id="back-to-tagged" style="margin-bottom:1em;padding:0.5em 1em;border:none;background:#294572;color:#fff;border-radius:4px;cursor:pointer;">&larr; Back to Tagged</button><h2>${data.name}</h2></div><div class="document-list-container"><div class="document-list" style="max-height:500px;overflow:auto;padding:1em;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.05);margin:1em 0;">${contentHtml}</div></div></div>`;
          documentsView.innerHTML = `<div class="document-view-section"><div class="document-view-header" style="display:flex;align-items:center;gap:0.75em;"><button id="back-to-tagged" style="margin-bottom:1em;padding:0.5em 1em;border:none;background:#294572;color:#fff;border-radius:4px;cursor:pointer;">&larr; Back to Tagged</button><button id="fullscreen-toggle" style="margin-bottom:1em;padding:0.5em 1em;border:none;background:#32486b;color:#fff;border-radius:4px;cursor:pointer;">Full Screen</button><h2 style="flex:1;text-align:center;margin:0;">${data.name}</h2></div><div class="document-list-container"><div class="document-list" style="max-height:500px;overflow:auto;padding:1em;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.05);margin:1em 0;">${contentHtml}</div></div></div>`;
          setTimeout(() => {
            const backBtn = document.getElementById('back-to-tagged');
            if (backBtn) {
              backBtn.onclick = () => {
                renderTaggedDocuments();
              };
            }
            // Full Screen toggle logic
            const fullscreenBtn = document.getElementById('fullscreen-toggle');
            const docSection = documentsView.querySelector('.document-view-section');
            if (fullscreenBtn && docSection) {
              fullscreenBtn.onclick = () => {
                docSection.classList.toggle('fullscreen-file-view');
                fullscreenBtn.textContent = docSection.classList.contains('fullscreen-file-view') ? 'Exit Full Screen' : 'Full Screen';
              };
            }
          }, 50);
        } catch (error) {
          documentsView.innerHTML = `<div>Error loading file: ${error.message}</div>`;
        }
      });
  });