const loginContainer = document.getElementById('login');
const registerContainer = document.getElementById('register');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const userRoleSelect = document.getElementById('userRole');

function login() {
    loginContainer.style.left = '4px';
    registerContainer.style.right = '-520px';
    loginBtn.style.backgroundColor = '#fd7e14'; // Orange for active
    registerBtn.style.backgroundColor = '#fff'; // White for inactive
}

function register() {
    loginContainer.style.left = '-520px';
    registerContainer.style.right = '4px';
    loginBtn.style.backgroundColor = '#fff'; // White for inactive
    registerBtn.style.backgroundColor = '#fd7e14'; // Orange for active
}

function myMenuFunction() {
    var i = document.getElementById("navMenu");

    if (i.className === "nav-menu") {
        i.className += " responsive";
    } else {
        i.className = "nav-menu";
    }
}

// Validation Functions
function validateLogin() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm.checkValidity()) {
        alert("Please fill in all fields.");
        return false;
    }
    return true; // Proceed with form submission
}

function validateRegistration() {
    const registerForm = document.getElementById('registerForm');
    const password = registerForm.querySelector('input[type="password"]').value;
    const confirmPassword = registerForm.querySelector('#confirmPassword').value;
    const email = registerForm.querySelector('input[type="email"]').value;

    if (!registerForm.checkValidity()) {
        alert("Please fill in all fields.");
        return false;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return false;
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return false;
    }

    return true; // Proceed with form submission
}

// Dropdown change event
userRoleSelect.addEventListener('change', function() {
    console.log(`Selected role: ${this.value}`);
});
