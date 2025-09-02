document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", function(e) {
            e.preventDefault();
            window.location.href = "Homepage.html"; // Redirect to homepage
        });
    }

    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
        loginBtn.addEventListener("click", function() {
            window.location.href = "Login.html";
        });
    }

    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach((link, idx) => {
        link.style.opacity = '0';
        link.style.transform = 'translateX(-40px)';
    });
    sidebarLinks.forEach((link, idx) => {
        setTimeout(() => {
            link.style.transition = 'opacity 0.6s, transform 0.6s';
            link.style.opacity = '1';
            link.style.transform = 'translateX(0)';
        }, idx * 500 + 100); // 0.6s per tab, 0.1s initial delay
    });
});