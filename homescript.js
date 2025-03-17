const createresume = document.getElementById("createres");
const analyzeresume = document.getElementById("analyzeres");

createresume.addEventListener("click", () => {
    window.location.href = "Templates.html";
});

analyzeresume.addEventListener("click", () => {
    window.location.href = "Analyze.html";
});


document.addEventListener("DOMContentLoaded", () => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (!isLoggedIn || !loggedInUser) {
        window.location.href = "login.html";
    } else {
        document.getElementById("username").innerText = loggedInUser.name;
    }

    document.getElementById("logout-btn").addEventListener("click", () => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("loggedInUser");
        window.location.href = "login.html";
    });
});

fetch("navbar.html")
.then(response => response.text())
.then(data => document.getElementById("navbar-container").innerHTML = data)
.then(() => {
    // Load navbar script after navbar is added
    const script = document.createElement("script");
    script.src = "navbarScript.js";
    document.body.appendChild(script);
});