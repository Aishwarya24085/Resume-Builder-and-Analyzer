document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    if (signupForm) {
        signupForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = document.getElementById("signup-name").value;
            const email = document.getElementById("signup-email").value;
            const password = document.getElementById("signup-password").value;
            const confirmPassword = document.getElementById("signup-confirm-password").value;

            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            if (localStorage.getItem("user")) {
                alert("An account already exists! Please log in.");
                return;
            }

            // Store the single user in localStorage
            const user = { name, email, password };
            localStorage.setItem("user", JSON.stringify(user));

            alert("Signed up successfully! Please log in.");
            window.location.href = "login.html";
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;
            const storedUser = JSON.parse(localStorage.getItem("user"));

            if (!storedUser) {
                alert("No user found! Please sign up first.");
                return;
            }

            if (storedUser.email !== email || storedUser.password !== password) {
                alert("Invalid email or password!");
                return;
            }

            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("loggedInUser", JSON.stringify(storedUser));

            alert(`Welcome back, ${storedUser.name}!`);
            window.location.href = "home.html";
        });
    }
});
