const loginContainer = document.getElementById('login');
const registerContainer = document.getElementById('register');

function login() {
    loginContainer.style.left = '4px';
    registerContainer.style.right = '-520px';
}

function register() {
    loginContainer.style.left = '-520px';
    registerContainer.style.right = '4px';
}

function myMenuFunction() {
    var i = document.getElementById("navMenu");

    if (i.className === "nav-menu") {
        i.className += " responsive";
    } else {
        i.className = "nav-menu";
    }
}



