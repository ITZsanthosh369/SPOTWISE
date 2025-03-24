// Authentication script for all pages

// Update profile dropdown with username if available
function updateProfileDropdown() {
    const profileIcon = document.querySelector('.profile-icon');
    const userName = localStorage.getItem('userName');
    
    if (profileIcon && userName) {
        // Add username to profile icon tooltip if not already there
        if (!profileIcon.getAttribute('title')) {
            profileIcon.setAttribute('title', `Logged in as ${userName}`);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in (token exists in localStorage)
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    
    const loginBtn = document.getElementById('loginBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    
    if (token && loginBtn && profileDropdown) {
        // User is logged in
        loginBtn.style.display = 'none';
        profileDropdown.style.display = 'block';
        updateProfileDropdown();
    } else if (loginBtn && profileDropdown) {
        // User is not logged in
        loginBtn.style.display = 'block';
        profileDropdown.style.display = 'none';
    }
    
    // Handle logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // If provider, send a logout request to update status
            if (userRole === 'provider') {
                fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }).catch(err => console.error('Logout error:', err));
            }
            
            // Clear authentication data
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            
            // Redirect to home page
            window.location.href = 'index.html';
        });
    }
});
