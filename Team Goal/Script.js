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
  
    // create an object to map sidebar link text to their corresponding content view
    const views = {
      "Recent Documents": document.getElementById("recent-documents-view"),
      "Tagged Documents": document.getElementById("tagged-documents-view"),
      "Version Control": document.getElementById("version-control-view"),
      About: document.getElementById("about-view"),
    };
  
    //======HELPER FUNCTIONS=====
  
    // Hide all content views by adding 'hidden' class
    const hideAllViews = () => {
      Object.values(views).forEach((view) => {
        view.classList.add("hidden");
      });
    };

    // Hide document views and version control view on page load and throughout navigation
    const recentDocumentsView = document.getElementById("recent-documents-view");
    const taggedDocumentsView = document.getElementById("tagged-documents-view");
    const versionControlView = document.getElementById("version-control-view");
    if (recentDocumentsView) recentDocumentsView.classList.add("visible");
    if (taggedDocumentsView) taggedDocumentsView.classList.add("visible");
    if (versionControlView) versionControlView.classList.add("visible");
  
    //   Set the clicked link as active and remove 'active class' from others
    const setActiveLink = (targetLink) => {
      sidebarItems.forEach((item) => {
        item.classList.remove("active");
      });
      targetLink.classList.add("active");
    };
  
    // Sidebar toggle logic for mobile
    // select hamburger menu button and the sidebar
    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".sidebar");
  
    if (menuToggle && sidebar) {
      menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("show-sidebar");
      });
    }
  
    //======Handle events for navigation======
    sidebarItems.forEach((item) => {
      item.addEventListener("click", (event) => {
        //   event.preventDefault();
  
        // get the text content of the clicked link
        const linkText = item.textContent.trim();
  
        // if on mobile screen, close sidebar after a link is clicked
        if (sidebar.classList.contains("show-sidebar")) {
          sidebar.classList.remove("show-sidebar");
        }
  
        // hide all content views and set the clicked link as active
        hideAllViews();
        setActiveLink(item);
        //   show content view corresponding to the clicked link
        if (views[linkText]) {
          views[linkText].classList.remove("hidden");
        }
  
        // Hide welcome message when the About link is clicked
        if (linkText === "About") {
          dashboardWelcome.classList.add("hidden");
        } else {
          dashboardWelcome.classList.remove("hidden");
        }

        // Always keep document views and version control view hidden
        if (recentDocumentsView) recentDocumentsView.classList.add("hidden");
        if (taggedDocumentsView) taggedDocumentsView.classList.add("hidden");
        if (versionControlView) versionControlView.classList.add("hidden");

        // Trigger animation for about cards when About view is shown
        if (linkText === "About") {
          animateAboutCards();
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
        let lastSearchQuery = '';
        searchBar.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            const query = searchBar.value;
            if (query.length > 1) {
              lastSearchQuery = query;
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
            // Show content in documents view with back button
            documentsView.innerHTML = `<div class="document-view-section"><div class="document-view-header"><button id="back-to-results" style="margin-bottom:1em;padding:0.5em 1em;border:none;background:#294572;color:#fff;border-radius:4px;cursor:pointer;">&larr; Back to Results</button><h2>${data.name}</h2></div><div class="document-list-container"><div class="document-list" style="max-height:500px;overflow:auto;padding:1em;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.05);margin:1em 0;">${contentHtml}</div></div></div>`;
            // Add back button event
            setTimeout(() => {
              const backBtn = document.getElementById('back-to-results');
              if (backBtn) {
                backBtn.onclick = () => {
                  if (lastSearchQuery) fetchGitHubRepoFiles(lastSearchQuery);
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
        const recentView = document.getElementById('recent-documents-view');
        let recentFiles = JSON.parse(localStorage.getItem('recentFiles') || '[]');
        let html = '<div class="document-view-section"><div class="document-view-header"><h2>Recent Documents</h2></div><div class="document-list-container"><ul>';
        if (recentFiles.length === 0) {
          html += '<li>No recent documents.</li>';
        } else {
          html += recentFiles.map(file => `<li><a href="#" class="recent-file-link" data-path="${file.path}">${file.name}</a></li>`).join('');
        }
        html += '</ul></div></div>';
        recentView.innerHTML = html;
      }

      // Show recent files when Recent Documents tab is clicked
      const recentTab = document.querySelector('.sidebar-item:nth-child(1)');
      if (recentTab) {
        recentTab.addEventListener('click', () => {
          renderRecentFiles();
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
        const documentsView = document.getElementById('recent-documents-view');
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
          setTimeout(() => {
            const backBtn = document.getElementById('back-to-recent');
            if (backBtn) {
              backBtn.onclick = () => {
                renderRecentFiles();
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
        try {
          const response = await fetch(apiUrl);
          const data = await response.json();
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
          // Add save button logic
          setTimeout(() => {
            const saveBtn = document.getElementById('save-file-btn');
            if (saveBtn) {
              saveBtn.onclick = async () => {
                const newContent = document.getElementById('file-editor').value;
                await saveFileToGitHub(filePath, newContent, data.sha);
              };
            }
            const backBtn = document.getElementById('back-to-results');
            if (backBtn) {
              backBtn.onclick = () => {
                if (lastSearchQuery) fetchGitHubRepoFiles(lastSearchQuery);
              };
            }
          }, 50);
        } catch (error) {
          documentsView.innerHTML = `<div>Error loading file: ${error.message}</div>`;
        }
      });
  });