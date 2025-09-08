document.addEventListener("DOMContentLoaded", () => {
  // --- Sidebar Badge Setup ---
  const badgeTypes = [
    { type: 'recent', match: /recent/i, badgeId: 'recentBadge' },
    { type: 'tags', match: /tags?/i, badgeId: 'tagsBadge' },
    { type: 'version', match: /version\s*control/i, badgeId: 'versionBadge' }
  ];
  document.querySelectorAll('.sidebar-item').forEach(item => {
    const text = item.textContent.trim();
    const found = badgeTypes.find(cfg => cfg.match.test(text));
    if (found && !item.querySelector('.sidebar-badge')) {
      const badge = document.createElement('span');
      badge.className = 'sidebar-badge';
      badge.id = found.badgeId;
      badge.style.display = 'inline-block';
      badge.style.marginLeft = '0.5em';
      badge.style.background = '#d32f2f';
      badge.style.color = '#fff';
      badge.style.borderRadius = '50%';
      badge.style.padding = '2px 7px';
      badge.style.fontSize = '0.85em';
      badge.style.verticalAlign = 'middle';
      badge.style.transition = 'transform 0.2s';
      badge.textContent = '0';
      item.appendChild(badge);
    }
  });

  function updateSidebarBadge(type, count) {
    const cfg = badgeTypes.find(b => b.type === type);
    if (!cfg) return;
    const badge = document.getElementById(cfg.badgeId);
    const item = Array.from(document.querySelectorAll('.sidebar-item')).find(i => cfg.match.test(i.textContent.trim()));
    if (badge && item) {
      badge.textContent = count;
      badge.style.display = 'inline-block';
      if (count > 0) {
        badge.classList.remove('pop-badge');
        void badge.offsetWidth;
        badge.classList.add('pop-badge');
        item.classList.remove('pop-badge-item');
        void item.offsetWidth;
        item.classList.add('pop-badge-item');
        setTimeout(() => {
          badge.classList.remove('pop-badge');
          item.classList.remove('pop-badge-item');
        }, 400);
      }
    }
  }

  updateSidebarBadge('recent', getRecentFiles().length);
  updateSidebarBadge('tags', getTaggedFiles().length);
  updateSidebarBadge('version', getEditedFiles().length);
  window.updateSidebarBadge = updateSidebarBadge;

  const style = document.createElement('style');
  style.textContent = `
.pop-badge {
  animation: popBadgeAnim 0.4s;
}
@keyframes popBadgeAnim {
  0% { transform: scale(1); }
  30% { transform: scale(1.4); }
  60% { transform: scale(0.85); }
  100% { transform: scale(1); }
}
.pop-badge-item {
  animation: popBadgeItemAnim 0.4s;
}
@keyframes popBadgeItemAnim {
  0% { box-shadow: 0 0 0 0 #d32f2f; }
  40% { box-shadow: 0 0 0 6px #d32f2f44; }
  100% { box-shadow: 0 0 0 0 #d32f2f; }
}
`;
  document.head.appendChild(style);
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

  // Removed automatic GitHub file fetch on page load
    // Dropdown menu logic for Home.html user icon
    const userDropdown = document.getElementById('userDropdown');
    const logoutMenuItem = document.getElementById('logoutMenuItem');
    if (userIcon && userDropdown) {
        userIcon.addEventListener('click', function(e) {
          e.stopPropagation();
          if (userDropdown.classList.contains('show')) {
            userDropdown.classList.remove('show');
            setTimeout(() => { userDropdown.style.display = 'none'; }, 250);
          // --- Sidebar Badge Setup ---
          document.addEventListener("DOMContentLoaded", () => {
            // Add badge spans to sidebar items if not present
            const badgeTypes = [
              { type: 'recent', match: /recent/i, badgeId: 'recentBadge' },
              { type: 'tags', match: /tags?/i, badgeId: 'tagsBadge' },
              { type: 'version', match: /version\s*control/i, badgeId: 'versionBadge' }
            ];
            document.querySelectorAll('.sidebar-item').forEach(item => {
              const text = item.textContent.trim();
              const found = badgeTypes.find(cfg => cfg.match.test(text));
              if (found && !item.querySelector('.sidebar-badge')) {
                const badge = document.createElement('span');
                badge.className = 'sidebar-badge';
                badge.id = found.badgeId;
                badge.style.display = 'none';
                badge.style.marginLeft = '0.5em';
                badge.style.background = '#d32f2f';
                badge.style.color = '#fff';
                badge.style.borderRadius = '50%';
                badge.style.padding = '2px 7px';
                badge.style.fontSize = '0.85em';
                badge.style.verticalAlign = 'middle';
                badge.style.transition = 'transform 0.2s';
                item.appendChild(badge);
              }
            });

            // Helper to update badge count and animate
            function updateSidebarBadge(type, count) {
              const cfg = badgeTypes.find(b => b.type === type);
              if (!cfg) return;
              const badge = document.getElementById(cfg.badgeId);
              const item = Array.from(document.querySelectorAll('.sidebar-item')).find(i => cfg.match.test(i.textContent.trim()));
              if (badge && item) {
                badge.textContent = count;
                badge.style.display = 'inline-block';
                if (count > 0) {
                  // Pop animation
                  badge.classList.remove('pop-badge');
                  void badge.offsetWidth; // force reflow
                  badge.classList.add('pop-badge');
                  item.classList.remove('pop-badge-item');
                  void item.offsetWidth;
                  item.classList.add('pop-badge-item');
                  setTimeout(() => {
                    badge.classList.remove('pop-badge');
                    item.classList.remove('pop-badge-item');
                  }, 400);
                }
              }
            }

            // Initial badge update
            updateSidebarBadge('recent', getRecentFiles().length);
            updateSidebarBadge('tags', getTaggedFiles().length);
            updateSidebarBadge('version', getEditedFiles().length);

            // Expose for use in addToRecentFiles, addToTaggedFiles, addToEditedFiles
            window.updateSidebarBadge = updateSidebarBadge;

            // Add pop-badge and pop-badge-item animation styles
            const style = document.createElement('style');
            style.textContent = `
          .pop-badge {
            animation: popBadgeAnim 0.4s;
          }
          @keyframes popBadgeAnim {
            0% { transform: scale(1); }
            30% { transform: scale(1.4); }
            60% { transform: scale(0.85); }
            100% { transform: scale(1); }
          }
          .pop-badge-item {
            animation: popBadgeItemAnim 0.4s;
          }
          @keyframes popBadgeItemAnim {
            0% { box-shadow: 0 0 0 0 #d32f2f; }
            40% { box-shadow: 0 0 0 6px #d32f2f44; }
            100% { box-shadow: 0 0 0 0 #d32f2f; }
          }
          `;
            document.head.appendChild(style);
          });
          } else {
            userDropdown.style.display = 'block';
            setTimeout(() => { userDropdown.classList.add('show'); }, 10);
          }
        });
        // Call this function when you want to display the files (e.g., after clicking a tab or search)
        // fetchGitHubRepoFiles();

            if (window.updateSidebarBadge) window.updateSidebarBadge('recent', files.length);
        // Make sure you have an element with id 'github-file-list' in your HTML to display the results
        // Example: <ul id="github-file-list"></ul>
        document.addEventListener('click', function(e) {
          if (userDropdown.classList.contains('show')) {
            userDropdown.classList.remove('show');
            setTimeout(() => { userDropdown.style.display = 'none'; }, 250);
          }
        });
            if (window.updateSidebarBadge) window.updateSidebarBadge('version', files.length);
    }
    if (logoutMenuItem) {
      logoutMenuItem.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'Acelogin.html';
      });
    }
            if (window.updateSidebarBadge) window.updateSidebarBadge('tags', files.length);
     // Login logic for ACElogin.html
      const loginForm = document.querySelector('.login-form');
      if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
          e.preventDefault();
          const userID = document.getElementById('userID').value.trim();
          const errorDiv = document.getElementById('login-error');
          if (userID.length > 0) {
            errorDiv.style.display = 'none';
            localStorage.setItem('userID', userID); // Store user ID for Home page
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

       // Hide welcome message when the About link is clicked
        if (linkText === "About") {
          dashboardWelcome.classList.add("hidden");
          animateAboutCards();
        } else {
          dashboardWelcome.classList.remove("hidden");
        }
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
    // --- GitHub Repo Search, Result, and File View Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const searchBar = document.getElementById('search-bar');
  const fileList = document.getElementById('github-file-list');
  const documentsView = document.getElementById('recent-view');
  if (documentsView) documentsView.style.display = 'none';

  // Step 2: Search logic
  async function fetchGitHubRepoFiles(query) {
    const repo = 'tralyonh4/TG--Web-UI'; // Change to your repo if needed
    const apiUrl = `https://api.github.com/repos/${repo}/git/trees/main?recursive=1`;
    if (documentsView) documentsView.style.display = 'block';
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      let resultsHtml = '';
      if (!data.tree) {
        resultsHtml = '<li>No files found or API limit reached.</li>';
      } else {
        const files = data.tree.filter(item => item.type === 'blob' && item.path.toLowerCase().includes(query.toLowerCase()));
        if (files.length === 0) {
          resultsHtml = '<li>No matching files found.</li>';
        } else {
          resultsHtml = '<li class="bubble-item bubble-header"><span class="file-name">Filename</span><span class="file-timestamp">Timestamp</span></li>' +
          files.map(file => `
            <li class="bubble-item">
              <a href="#" class="file-name" data-path="${file.path}">${file.path.split('/').pop()}</a>
              <span class="file-timestamp">${new Date().toLocaleString()}</span>
            </li>
          `).join('');
        }
      }
      if (documentsView) {
        documentsView.innerHTML = `<div class="document-view-section"><div class="document-view-header"><h2>Search Results</h2></div><div class="document-list-container"><ul id="github-file-list" class="document-list">${resultsHtml}</ul></div></div>`;
      }
      // Add event listeners for label selectors and apply buttons
      setTimeout(() => {
        document.querySelectorAll('.apply-label-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const path = btn.getAttribute('data-path');
            const select = document.querySelector(`.sensitivity-label[data-path='${path}']`);
            const label = select ? select.value : '';
            if (label) {
              // Add to tagged files
              const name = path.split('/').pop();
              addToTaggedFiles({ name, path }, [label]);
              btn.textContent = 'Applied!';
              setTimeout(() => { btn.textContent = 'Apply'; }, 1200);
            }
          });
        });
      }, 100);
    } catch (error) {
      if (documentsView) {
        documentsView.innerHTML = `<div class="document-view-section"><div class="document-view-header"><h2>Search Results</h2></div><div class="document-list-container"><ul id="github-file-list"><li>Error fetching files: ${error.message}</li></ul></div></div>`;
      }
    }
  }

  // Step 2: Listen for Enter on search bar
  if (searchBar) {
    window.lastSearchQuery = '';
    searchBar.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchBar.value;
        if (query.length > 1) {
          window.lastSearchQuery = query;
          if (typeof hideAllViews === 'function') hideAllViews();
          if (documentsView) documentsView.style.display = 'block';
          fetchGitHubRepoFiles(query);
          searchBar.value = '';
        }
      }
    });
  }

  // Step 3: Show file content when result is clicked
  document.addEventListener('click', async (e) => {
    const target = e.target.closest('a[data-path]');
    if (!target) return;
    e.preventDefault();
    const fileName = target.textContent;
    const filePath = target.getAttribute('data-path');
    const repo = 'tralyonh4/TG--Web-UI';
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;
    // Hide all list views, show only the file view (recent-view)
    const views = {
      'recent': document.getElementById('recent-view'),
      'tags': document.getElementById('tag-view'),
      'version': document.getElementById('version-control-view'),
      'about': document.getElementById('about-view')
    };
    Object.values(views).forEach(v => { if (v) v.style.display = 'none'; });
    const documentsView = document.getElementById('recent-view');
    if (documentsView) documentsView.style.display = 'block';
    // Determine which list the user came from
    if (target.closest('#github-file-list')) {
      window.lastListView = 'search';
    } else if (target.closest('#recent-view')) {
      window.lastListView = 'recent';
    } else if (target.closest('#tag-view')) {
      window.lastListView = 'tags';
    } else if (target.closest('#version-control-view')) {
      window.lastListView = 'version';
    }
    let latestSha = null;
    async function renderEditor() {
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        latestSha = data.sha;
        let contentHtml = '';
        if (data.type === 'file') {
          // --- Add to Recent when file is viewed ---
          addToRecentFiles({ name: data.name, path: filePath });
          if (isEditableFileType(data.name) && data.encoding === 'base64' && data.content) {
            const decoded = atob(data.content.replace(/\n/g, ''));
            contentHtml = `<textarea id=\"file-editor\" style=\"width:100%;height:400px;\">${decoded}</textarea><br><button id=\"save-file-btn\" style=\"margin-top:1em;padding:0.5em 1em;border:none;background:#294572;color:#fff;border-radius:4px;cursor:pointer;\">Save</button>`;
          } else if (data.encoding === 'base64' && data.content && data.name.match(/\.(pdf|docx)$/i)) {
            let mimeType = data.name.match(/\.pdf$/i) ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            contentHtml = `<iframe src=\"data:${mimeType};base64,${data.content}\" style=\"width:100%;height:600px;border:none;\"></iframe>`;
          } else if (data.encoding === 'base64' && data.content && data.name.match(/\.(jpg|jpeg|png|gif|bmp)$/i)) {
            contentHtml = `<img src=\"data:${data._links.self.includes('.svg') ? 'image/svg+xml' : 'image/*'};base64,${data.content}\" alt=\"${data.name}\" style=\"max-width:100%;height:auto;\" />`;
          } else if (data.encoding === 'base64' && data.content) {
            const decoded = atob(data.content.replace(/\n/g, ''));
            contentHtml = `<pre style=\"white-space:pre-wrap;\">${decoded}</pre>`;
          } else {
            contentHtml = '<div>Unable to display file content.</div>';
          }
        } else {
          contentHtml = '<div>Unable to retrieve file.</div>';
        }
        documentsView.innerHTML = `<div class=\"document-view-section\"><div class=\"document-view-header\"><button id=\"back-to-results\">&larr; Back to Results</button><button id=\"fullscreen-toggle\">Full Screen</button></div><div class=\"document-list-container\"><div class=\"document-list\">${contentHtml}</div></div></div>`;
        setTimeout(() => {
          const saveBtn = document.getElementById('save-file-btn');
          if (saveBtn) {
            saveBtn.onclick = async () => {
              saveBtn.disabled = true;
              const newContent = document.getElementById('file-editor').value;
              // --- Add to Edited when file is saved ---
              addToEditedFiles({ name: data.name, path: filePath });
              const result = await saveFileToGitHub(filePath, newContent, latestSha);
              if (result && result.success && result.newSha) {
                latestSha = result.newSha;
              } else if (result && result.success && result.content && result.content.sha) {
                latestSha = result.content.sha;
              }
              document.getElementById('file-editor').value = newContent;
              saveBtn.disabled = false;
            };
          }
          const backBtn = document.getElementById('back-to-results');
          if (backBtn) {
            backBtn.onclick = () => {
              // Hide file view, show correct list view
              documentsView.style.display = 'none';
              if (window.lastListView === 'search' && window.lastSearchQuery && window.lastSearchQuery.length > 0) {
                fetchGitHubRepoFiles(window.lastSearchQuery);
              } else if (window.lastListView === 'recent') {
                const v = document.getElementById('recent-view');
                if (v) v.style.display = 'block';
                renderRecentFiles();
              } else if (window.lastListView === 'tags') {
                const v = document.getElementById('tag-view');
                if (v) v.style.display = 'block';
                renderTaggedFiles();
              } else if (window.lastListView === 'version') {
                const v = document.getElementById('version-control-view');
                if (v) v.style.display = 'block';
                renderEditedFiles();
              } else {
                documentsView.innerHTML = '<div class="document-view-section"><div class="document-view-header"><h2>Search Results</h2></div><div class="document-list-container"><ul><li>No previous search to return to.</li></ul></div></div>';
                documentsView.style.display = 'block';
              }
            };
          }
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
    renderEditor();
  });
});

// --- Enable Editing and Saving for Files ---
function isEditableFileType(filename) {
  return /\.(js|py|css|html|json|ts|md|txt)$/i.test(filename);
}

async function saveFileToGitHub(path, content, sha) {
  // Assumes you have a backend endpoint at /api/save-file
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

// --- Merge all sidebar toggling logic into one DOMContentLoaded handler ---
document.addEventListener('DOMContentLoaded', () => {
  // Sidebar logic
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  const views = {
    'Recent': document.getElementById('recent-view'),
    'Tags': document.getElementById('tag-view'),
    'Version Control': document.getElementById('version-control-view'),
    'About': document.getElementById('about-view')
  };
  const dashboardWelcome = document.querySelector('.dashboard-welcome');
  const searchBarContainer = document.getElementById('search-bar')?.parentElement;
  let backBtnAnimated = false;
//Persistent back to home button//
  function showBackButton() {
    let backBtn = document.getElementById('back-to-home-btn');
    if (!backBtn) {
      backBtn = document.createElement('button');
      backBtn.id = 'back-to-home-btn';
      backBtn.textContent = '← Back to Home';
      document.body.appendChild(backBtn);
      backBtn.addEventListener('click', () => {
        // Hide all content areas
        hideAllViews();
        // Show greeter and search bar
        if (dashboardWelcome) dashboardWelcome.classList.remove('hidden');
        if (searchBarContainer) searchBarContainer.style.display = '';
        // Animate flip down, then hide
        backBtn.classList.remove('flip-up');
        backBtn.classList.add('flip-down');
        setTimeout(() => {
          backBtn.style.display = 'none';
          backBtn.classList.remove('flip-down');
          backBtnAnimated = false; // Reset flag so animation plays after home
        }, 500); // match flipDownToSidebar duration
      });
    }
    // Reset animation if already present
    backBtn.classList.remove('flip-up', 'flip-down');
    void backBtn.offsetWidth; // force reflow for repeat animation
    backBtn.style.display = 'block';
    if (!backBtnAnimated) {
      backBtn.classList.add('flip-up');
      backBtnAnimated = true;
    }
  }

  function hideAllViews() {
    Object.values(views).forEach(view => {
      if (view) view.style.display = 'none';
    });
    sidebarItems.forEach(item => item.classList.remove('active'));
  }
  // On load: hide all content areas, remove active from sidebar, show greeter/search
  hideAllViews();
  if (dashboardWelcome) dashboardWelcome.classList.remove('hidden');
  if (searchBarContainer) searchBarContainer.style.display = '';

  sidebarItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.getAttribute('data-section');
      hideAllViews();
      // Hide greeter and search bar
      if (dashboardWelcome) dashboardWelcome.classList.add('hidden');
      if (searchBarContainer) searchBarContainer.style.display = 'none';
      // Show the selected content area
      if (section && views) {
        let viewKey = null;
        if (section === 'recent') viewKey = 'Recent';
        if (section === 'tags') viewKey = 'Tags';
        if (section === 'version') viewKey = 'Version Control';
        if (section === 'about') viewKey = 'About';
        if (viewKey && views[viewKey]) {
          views[viewKey].style.display = 'block';
          item.classList.add('active');
          showBackButton();
          if (section === 'recent') renderRecentFiles();
          if (section === 'tags') renderTaggedFiles();
          if (section === 'version') renderEditedFiles();
        }
      }
    });
  });
  // On load, hide back button
  let backBtn = document.getElementById('back-to-home-btn');
  if (backBtn) backBtn.style.display = 'none';
});

// --- Data helpers for Recent, Tags, Version Control ---
function getRecentFiles() {
  return JSON.parse(localStorage.getItem('recentFiles') || '[]');
}
function setRecentFiles(files) {
  localStorage.setItem('recentFiles', JSON.stringify(files));
}
function getTaggedFiles() {
  return JSON.parse(localStorage.getItem('taggedFiles') || '[]');
}
function setTaggedFiles(files) {
  localStorage.setItem('taggedFiles', JSON.stringify(files));
}
function getEditedFiles() {
  return JSON.parse(localStorage.getItem('editedFiles') || '[]');
}
function setEditedFiles(files) {
  localStorage.setItem('editedFiles', JSON.stringify(files));
}

// --- Add to Recent when a file is viewed ---
function addToRecentFiles(file) {
  let files = getRecentFiles();
  files = files.filter(f => f.path !== file.path);
  files.unshift({...file, viewedAt: Date.now()});
  files = files.slice(0, 10);
  setRecentFiles(files);
  if (window.updateSidebarBadge) window.updateSidebarBadge('recent', files.length);
}

function removeFromRecentFiles(filePath) {
  let files = getRecentFiles();
  files = files.filter(f => f.path !== filePath);
  setRecentFiles(files);
  if (window.updateSidebarBadge) window.updateSidebarBadge('recent', files.length);
}
// --- Add to Edited when a file is saved ---
function addToEditedFiles(file) {
  let files = getEditedFiles();
  files = files.filter(f => f.path !== file.path);
  files.unshift({...file, editedAt: Date.now()});
  files = files.slice(0, 10);
  setEditedFiles(files);
  if (window.updateSidebarBadge) window.updateSidebarBadge('version', files.length);
}

function removeFromEditedFiles(filePath) {
  let files = getEditedFiles();
  files = files.filter(f => f.path !== filePath);
  setEditedFiles(files);
  if (window.updateSidebarBadge) window.updateSidebarBadge('version', files.length);
}
// --- Add to Tagged when a file is tagged (example) ---
function addToTaggedFiles(file, tags) {
  let files = getTaggedFiles();
  files = files.filter(f => f.path !== file.path);
  files.unshift({...file, tags});
  setTaggedFiles(files);
  if (window.updateSidebarBadge) window.updateSidebarBadge('tags', files.length);
}

function removeFromTaggedFiles(filePath) {
  let files = getTaggedFiles();
  files = files.filter(f => f.path !== filePath);
  setTaggedFiles(files);
  if (window.updateSidebarBadge) window.updateSidebarBadge('tags', files.length);
}
// --- Renderers ---
function renderRecentFiles() {
  const view = document.getElementById('recent-view');
  const files = getRecentFiles();
  view.innerHTML = `<div class="document-view-section">
    <div class="document-view-header"><h2>Recent</h2></div>
    <div class="document-list-container">
      <ul class="document-list">
        <li class="bubble-item bubble-header"><span class="file-name">Filename</span><span class="file-timestamp">Timestamp</span><span class="file-delete">Delete</span></li>
        ${
          files.length === 0
            ? '<li>No recent files.</li>'
            : files.map(f => `
                <li class="bubble-item">
                  <a href="#" class="file-name" data-path="${f.path}">${f.name}</a>
                  <span class="file-timestamp">${f.viewedAt ? new Date(f.viewedAt).toLocaleString() : ''}</span>
                  <button class="file-delete-btn" data-path="${f.path}" title="Delete">🗑️</button>
                </li>
              `).join('')
        }
      </ul>
    </div>
  </div>`;
  // Add delete button listeners
  view.querySelectorAll('.file-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const path = btn.getAttribute('data-path');
      removeFromRecentFiles(path);
      renderRecentFiles();
    });
  });
}

function renderTaggedFiles() {
  const view = document.getElementById('tag-view');
  const files = getTaggedFiles();
  view.innerHTML = `<div class="document-view-section">
    <div class="document-view-header"><h2>Tagged</h2></div>
    <div class="document-list-container">
      <ul class="document-list">
        <li class="bubble-item bubble-header"><span class="file-name">Filename</span><span class="file-timestamp">Timestamp</span><span class="file-badge">Tags</span><span class="file-delete">Delete</span></li>
        ${
          files.length === 0
            ? '<li>No tagged files.</li>'
            : files.map(f => `
                <li class="bubble-item">
                  <a href="#" class="file-name" data-path="${f.path}">${f.name}</a>
                  <span class="file-timestamp">${f.taggedAt ? new Date(f.taggedAt).toLocaleString() : ''}</span>
                  <span class="file-badge">${(f.tags||[]).join(', ')}</span>
                  <button class="file-delete-btn" data-path="${f.path}" title="Delete">🗑️</button>
                </li>
              `).join('')
        }
      </ul>
    </div>
  </div>`;
  // Add delete button listeners
  view.querySelectorAll('.file-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const path = btn.getAttribute('data-path');
      removeFromTaggedFiles(path);
      renderTaggedFiles();
    });
  });
}

function renderEditedFiles() {
  const view = document.getElementById('version-control-view');
  const files = getEditedFiles();
  view.innerHTML = `<div class="document-view-section">
    <div class="document-view-header"><h2>Version Control</h2></div>
    <div class="document-list-container">
      <ul class="document-list">
        <li class="bubble-item bubble-header"><span class="file-name">Filename</span><span class="file-timestamp">Timestamp</span><span class="file-delete">Delete</span></li>
        ${
          files.length === 0
            ? '<li>No edited files.</li>'
            : files.map(f => `
                <li class="bubble-item">
                  <a href="#" class="file-name" data-path="${f.path}">${f.name}</a>
                  <span class="file-timestamp">${f.editedAt ? new Date(f.editedAt).toLocaleString() : ''}</span>
                  <button class="file-delete-btn" data-path="${f.path}" title="Delete">🗑️</button>
                </li>
              `).join('')
        }
      </ul>
    </div>
  </div>`;
  // Add delete button listeners
  view.querySelectorAll('.file-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const path = btn.getAttribute('data-path');
      removeFromEditedFiles(path);
      renderEditedFiles();
    });
  });
}

// --- Hook up to sidebar toggling ---
document.querySelectorAll('.sidebar-item').forEach(item => {
  item.addEventListener('click', (e) => {
    const text = item.textContent.trim();
    if (text === 'Recent') renderRecentFiles();
    if (text === 'Tags') renderTaggedFiles();
    if (text === 'Version Control') renderEditedFiles();
  });
});
// --- Example: call addToRecentFiles({name, path}) when a file is viewed
// --- Example: call addToEditedFiles({name, path}) when a file is saved
// --- Example: call addToTaggedFiles({name, path}, ['Confidential']) when tagged
