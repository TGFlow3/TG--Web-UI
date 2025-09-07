document.addEventListener("DOMContentLoaded", () => 
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

    // Animate sidebar items fade-in from left, one after another
    sidebarItems.forEach((item, idx) => {
      setTimeout(() => {
        item.classList.add('fade-in');
      }, idx * 300 + 400); // 300ms delay between each, 400ms initial delay
    });

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
    });
  });
});
