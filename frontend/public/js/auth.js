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

// Function to handle login
async function login(email, password) {
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();
        
        // Store auth data in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userName', data.userName);
        localStorage.setItem('userRole', data.role);
        
        // If user is a provider, set their status to online
        if (data.role === 'provider') {
            // Update provider status to online in backend
            await updateProviderStatusOnLogin('online');
        }
        
        // Update UI based on login state
        updateAuthUI(true);
        
        return true;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Function to handle logout
function logout() {
    // If user is a provider, set their status to offline before clearing localStorage
    const userRole = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');
    
    if (userRole === 'provider' && token) {
        // Update provider status to offline in backend
        updateProviderStatusOnLogout('offline');
    }
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('providerStatus');
    
    // Update UI based on logout state
    updateAuthUI(false);
    
    // Redirect to home page if not already there
    if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
        window.location.href = 'index.html';
    }
}

// Update provider status on login
async function updateProviderStatusOnLogin(status) {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch('http://localhost:3000/api/users/status', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        
        if (!response.ok) {
            console.warn('Failed to update provider status on login');
            return;
        }
        
        // Update localStorage with the new status
        localStorage.setItem('providerStatus', status);
        
    } catch (error) {
        console.error('Error updating provider status on login:', error);
    }
}

// Update provider status on logout (using synchronous XHR to ensure it completes before page unload)
function updateProviderStatusOnLogout(status) {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const xhr = new XMLHttpRequest();
    xhr.open('PATCH', 'http://localhost:3000/api/users/status', false); // false = synchronous
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    
    try {
        xhr.send(JSON.stringify({ status }));
    } catch (e) {
        console.error('Error updating provider status on logout:', e);
    }
}

// Fetch provider status from backend
async function fetchProviderStatus() {
    try {
        const userRole = localStorage.getItem('userRole');
        const token = localStorage.getItem('token');
        
        if (userRole !== 'provider' || !token) return;
        
        const response = await fetch('http://localhost:3000/api/users/status', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            console.warn('Failed to fetch provider status');
            return;
        }
        
        const data = await response.json();
        
        // Update localStorage with the fetched status
        if (data.status) {
            localStorage.setItem('providerStatus', data.status);
        }
        
        return data.status;
    } catch (error) {
        console.error('Error fetching provider status:', error);
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
            logout();
        });
    }
    
    // Fetch provider status if logged in as provider
    if (token && localStorage.getItem('userRole') === 'provider') {
        fetchProviderStatus().then(status => {
            // If there are UI elements that need to reflect this status, update them here
            if (typeof updateStatusUI === 'function' && status) {
                updateStatusUI(status);
            }
        });
    }
});
