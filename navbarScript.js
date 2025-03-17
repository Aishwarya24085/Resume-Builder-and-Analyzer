document.addEventListener("DOMContentLoaded", () => {
    const userDropdown = document.getElementById("user-dropdown");
    const usernameDisplay = document.getElementById("username-display");
    const dropdownMenu = document.getElementById("dropdown-menu");
    const logoutBtn = document.getElementById("logout-btn");

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn && loggedInUser) {
        usernameDisplay.innerText = loggedInUser.name;
    } else {
        usernameDisplay.innerText = "Login";
        userDropdown.onclick = () => window.location.href = "login.html";
        return;
    }

    // Toggle dropdown menu
    userDropdown.addEventListener("click", () => {
        dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
    });

    // Logout functionality
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("loggedInUser");
        window.location.href = "index.html";
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (event) => {
        if (!userDropdown.contains(event.target)) {
            dropdownMenu.style.display = "none";
        }
    });
});
