
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
          window.location.href = 'ACELogin.html';
        });
      }
  }

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
        window.location.href = 'Home.html';
      } else {
        errorDiv.textContent = 'UserID is required.';
        errorDiv.style.display = 'block';
      }
    });
  }

  // Logout logic for Home.html
  const logoutBtn = document.getElementById('logoutBtn');
  console.log('logoutBtn:', logoutBtn);
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      console.log('logoutBtn clicked');
      window.location.href = 'ACELogin.html';
    });
  }

  // Sidebar nav and welcome message logic
  const sidebarItems = document.querySelectorAll(".sidebar-item");
  const dashboardWelcome = document.querySelector(".dashboard-welcome");
  if (localStorage.getItem('sidebarAnimate') === 'true') {
    sidebarItems.forEach((item, idx) => {
      setTimeout(() => {
        item.classList.add('fade-in');
      }, idx * 300 + 400); // 300ms delay between each, 400ms initial delay
    });
    localStorage.removeItem('sidebarAnimate');
  }

  // Hide welcome message when the About link is clicked
  // (Assuming there is a link with text "About" somewhere)
  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      const linkText = item.textContent.trim();
      if (linkText === "About" && dashboardWelcome) {
        dashboardWelcome.classList.add("hidden");
        animateAboutCards();
      } else if (dashboardWelcome) {
        dashboardWelcome.classList.remove("hidden");
      }
    });
  });

  // Pop-in animation for about cards
  function animateAboutCards() {
    const cards = document.querySelectorAll('.about-card');
    cards.forEach(card => card.classList.remove('pop-in'));
    cards.forEach((card, i) => {
      setTimeout(() => {
        card.classList.add('pop-in');
      }, i * 350);
    });
  }

  // --- Sidebar toggling logic ---
  const views = {
    'Recent': document.getElementById('recent-view'),
    'Tags': document.getElementById('tag-view'),
    'Version Control': document.getElementById('version-control-view'),
    'About': document.getElementById('about-view')
  };
  const searchBarContainer = document.getElementById('search-bar')?.parentElement;
  let backBtnAnimated = false;

  function showBackButton() {
    let backBtn = document.getElementById('back-to-home-btn');
    if (!backBtn) {
      backBtn = document.createElement('button');
      backBtn.id = 'back-to-home-btn';
      backBtn.textContent = '← Back to Home';
      document.body.appendChild(backBtn);
      backBtn.addEventListener('click', () => {
        hideAllViews();
        if (dashboardWelcome) dashboardWelcome.classList.remove('hidden');
        if (searchBarContainer) searchBarContainer.style.display = '';
        backBtn.classList.remove('flip-up');
        backBtn.classList.add('flip-down');
        setTimeout(() => {
          backBtn.style.display = 'none';
          backBtn.classList.remove('flip-down');
          backBtnAnimated = false;
        }, 500);
      });
    }
    backBtn.classList.remove('flip-up', 'flip-down');
    void backBtn.offsetWidth;
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
  hideAllViews();
  if (dashboardWelcome) dashboardWelcome.classList.remove('hidden');
  if (searchBarContainer) searchBarContainer.style.display = '';

  sidebarItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.getAttribute('data-section');
      hideAllViews();
      if (dashboardWelcome) dashboardWelcome.classList.add('hidden');
      if (searchBarContainer) searchBarContainer.style.display = 'none';
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
    });
  });
  let backBtn = document.getElementById('back-to-home-btn');
  if (backBtn) backBtn.style.display = 'none';
});

// --- Data helpers ---
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

// Fade-in animation for file elements
      function animateFilesFadeIn(bubbleItems) {
        bubbleItems.forEach((el, i) => {
          el.classList.add('fade-in');
          setTimeout(() => {
            el.classList.add('visible');
          }, i * 300); // 300ms delay between each
        });
      }

// --- Renderers ---

// --- RAG Search Results Renderer (two-pane layout) ---
  function renderRAGResults(data) {
    const view = document.getElementById('recent-view');
    if (!view) return;

    const answer = (data && data.llm_answer) ? data.llm_answer : 'No answer provided.';
    const files = Array.from(new Set((data && data.referenced_files) ? data.referenced_files : []));

    const escapeHtml = (str) => String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    const filesListHtml = files.length
      ? files.map(fpRaw => {
          const fp = String(fpRaw || '');
          const fileNameRaw = fp.includes('/') ? fp.split('/').pop() : (fp.includes('\\') ? fp.split('\\').pop() : fp);
          const fileName = escapeHtml(fileNameRaw || '');
          const ext = escapeHtml((fileNameRaw && fileNameRaw.includes('.')) ? fileNameRaw.split('.').pop() : '');
          const fullPath = escapeHtml(fp);
          return `
            <li class="bubble-item" title="${fullPath}">
              <span class="file-name">${fileName}</span>
              <span class="file-timestamp">${ext}</span>
              <div class="file-path">${fullPath}</div>
            </li>
          `;
        }).join('')
      : '<li class="bubble-item"><span class="file-name">No files referenced</span></li>';

    view.innerHTML = `
      <div class="document-view-section">
        <div class="document-view-header"><h2>Search Results</h2></div>
        <div class="results-split">
          <!-- Left Pane: LLM Answer -->
          <div class="results-pane">
            <h3 class="pane-title">Flow</h3>
            <div class="document-list-container">
              <ul class="document-list">
                <li class="bubble-item"><span class="file-name" id="rag-answer" style="white-space: pre-wrap;"></span></li>
              </ul>
            </div>
          </div>

          <!-- Right Pane: Files Referenced -->
          <div class="results-pane" id="files-pane">
            <h3 class="pane-title">Files Referenced (${files.length})</h3>
            <div class="document-list-container">
              <ul class="document-list">
                ${filesListHtml}
              </ul>
            </div>
          </div>
        </div>
      </div>`;
    const bubbleItems = view.querySelectorAll('.results-pane#files-pane .bubble-item');
    animateFilesFadeIn(bubbleItems);

    // Add click event listeners to file bubbles in the right pane
bubbleItems.forEach(item => {
  item.addEventListener('click', function() {
    const filePath = item.querySelector('.file-path')?.textContent;
    if (!filePath) return;
    const filesPane = document.getElementById('files-pane');
    if (!filesPane) return;

    const fileNameRaw = filePath.includes('/') ? filePath.split('/').pop() : (filePath.includes('\\') ? filePath.split('\\').pop() : filePath);
    const ext = (fileNameRaw && fileNameRaw.includes('.')) ? fileNameRaw.split('.').pop().toLowerCase() : '';

    // IMAGE
    if (['png', 'jpg', 'jpeg'].includes(ext)) {
      filesPane.innerHTML = `
        <h3 class='pane-title'>${filePath}</h3>
        <img src="/api/file?path=${encodeURIComponent(filePath)}" style="max-width:100%;border-radius:8px;" />
        <button id='back-to-files-btn'>Back to files</button>
      `;
    }
    // PDF
    else if (ext === 'pdf') {
      filesPane.innerHTML = `
        <h3 class='pane-title'>${filePath}</h3>
        <iframe src="/api/file?path=${encodeURIComponent(filePath)}" width="100%" height="600" style="border-radius:8px;"></iframe>
        <button id='back-to-files-btn'>Back to files</button>
      `;
    }
    // DOCX - DOWNLOAD LINK ONLY
    else if (ext === 'docx') {
      filesPane.innerHTML = `
        <h3 class='pane-title'>${filePath}</h3>
        <a href="/api/file?path=${encodeURIComponent(filePath)}" download>Download DOCX</a>
        <button id='back-to-files-btn'>Back to files</button>
      `;
    }
    // HTML - as plain text
    else if (ext === 'html') {
      fetch(`/api/file?path=${encodeURIComponent(filePath)}`)
        .then(res => res.ok ? res.text() : Promise.reject('Failed to load file'))
        .then(content => {
          filesPane.innerHTML = `
            <h3 class='pane-title'>${filePath}</h3>
            <pre class='file-content' style='white-space: pre-wrap; background: #f8f8f8; padding: 1em; border-radius: 6px;'>${content}</pre>
            <button id='back-to-files-btn'>Back to files</button>
          `;
          filesPane.querySelector('#back-to-files-btn').addEventListener('click', () => renderRAGResults(data));
        })
        .catch(err => {
          filesPane.innerHTML = `<h3 class='pane-title'>Error</h3><div>${err}</div>`;
        });
    }
    // TEXT/CODE FILE (default)
    else {
      fetch(`/api/file?path=${encodeURIComponent(filePath)}`)
        .then(res => res.ok ? res.text() : Promise.reject('Failed to load file'))
        .then(content => {
          filesPane.innerHTML = `
            <h3 class='pane-title'>${filePath}</h3>
            <pre class='file-content' style='white-space: pre-wrap; background: #f8f8f8; padding: 1em; border-radius: 6px;'>${content}</pre>
            <button id='back-to-files-btn'>Back to files</button>
          `;
          filesPane.querySelector('#back-to-files-btn').addEventListener('click', () => renderRAGResults(data));
        })
        .catch(err => {
          filesPane.innerHTML = `<h3 class='pane-title'>Error</h3><div>${err}</div>`;
        });
    }
    // Add back button for all cases except fetch-based, for consistency
    if (filesPane.querySelector('#back-to-files-btn')) {
      filesPane.querySelector('#back-to-files-btn').addEventListener('click', () => renderRAGResults(data));
    }
  });
});

      

    // Safely set the answer text to avoid HTML injection
    const answerEl = document.getElementById('rag-answer');
    if (answerEl) answerEl.textContent = String(answer);
  }

  // --- Search Bar Handler ---
  document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('search-bar');
    if (!searchBar) {
      console.error('Search bar element not found when initializing search handler');
      return;
    }
    searchBar.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        const query = searchBar.value.trim();
        if (query.length > 1) {
          const recentView = document.getElementById('recent-view');
          if (recentView) {
            recentView.style.display = 'block';
            recentView.innerHTML = `
              <div class="document-view-section">
                <div class="document-view-header"><h2>Search Results</h2></div>
                <div class="results-split">
                  <!-- Left Pane: LLM Answer -->
                  <div class="results-pane">
                    <h3 class="pane-title">Flow</h3>
                    <div class="document-list-container">
                      <ul class="document-list">
                        <li class="bubble-item"><span class="file-name" style="white-space: pre-wrap;">One moment while your search is being processed...</span></li>
                      </ul>
                    </div>
                  </div>
                  <!-- Right Pane: Files Referenced -->
                  <div class="results-pane">
                    <h3 class="pane-title">Referenced Files</h3>
                    <div class="document-list-container">
                      <ul class="document-list">
                      </ul>
                    </div>
                  </div>
                </div>
              </div>`;
                
              
              // Example usage after files are rendered:
              const fileElements = document.querySelectorAll('.file-name'); // Adjust selector as needed
              animateFilesFadeIn(fileElements);
          }
          fetch('/api/rag', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
          })
          .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          })
          .then(data => {
            renderRAGResults(data);
          })
          .catch(err => {
            if (recentView) {
              recentView.innerHTML = `<div class="document-list-container"><ul class="document-list"><li>Error: ${err.message}</li></ul></div>`;
            }
          });
        }
      }
    });
  });

  // ... existing renderer functions (renderRecentFiles, renderTaggedFiles, etc.) ...
function renderRecentFiles() {
  const view = document.getElementById('recent-view');
  const files = getRecentFiles();
  view.innerHTML = `<div class="document-view-section">
    <div class="document-view-header"><h2>Recent</h2></div>
    <div class="document-list-container">
      <ul class="document-list">
      </ul>
    </div>
  </div>`;
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
    </div>
  </div>`;
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
      </ul>
    </div>
  </div>`;
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