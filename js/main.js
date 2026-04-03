// भटभटे Vehicle Rental Management System - Main JavaScript

// API Base URL
const API_URL = 'api';
// Current User State
let currentUser = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    initNavbar();
    initFABs();
});

// Check if user is logged in
async function checkSession() {
    try {
        const response = await fetch('/-_management_system/api/auth.php');
        const data = await response.json();

        if (data.success) {
            currentUser = data.data;
            updateUIForLoggedInUser();
        } else {
            currentUser = null;
            updateUIForLoggedOutUser();
        }
    } catch (error) {
        console.error('Session check error:', error);
    }
}

// Update UI based on login status
function updateUIForLoggedInUser() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    const myBookingsLink = document.getElementById('myBookingsLink');
    const adminLink = document.getElementById('adminLink');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    
    if (userInfo) {
        userInfo.style.display = 'flex';
        if (userName) userName.textContent = currentUser.name;
    }
    
    if (myBookingsLink) myBookingsLink.style.display = 'block';
    
    if (adminLink && currentUser.role === 'admin') {
        adminLink.style.display = 'block';
    }
}

function updateUIForLoggedOutUser() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userInfo = document.getElementById('userInfo');
    const myBookingsLink = document.getElementById('myBookingsLink');
    const adminLink = document.getElementById('adminLink');
    
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (registerBtn) registerBtn.style.display = 'inline-block';
    if (userInfo) userInfo.style.display = 'none';
    if (myBookingsLink) myBookingsLink.style.display = 'none';
    if (adminLink) adminLink.style.display = 'none';
}

// Logout Function
async function logout() {
    try {
        const response = await fetch(`${API_URL}/auth.php?action=logout`, {
            method: 'POST'
        });
        const data = await response.json();

        if (data.success) {
            showAlert('Logged out successfully', 'success');
            currentUser = null;
            // Corrected line
            window.location.href = '/-_management_system/index.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
        showAlert('Logout failed', 'error');
    }
}

// Initialize Navbar
function initNavbar() {
    const navbarToggle = document.getElementById('navbarToggle');
    const navbarMenu = document.getElementById('navbarMenu');
    
    if (navbarToggle && navbarMenu) {
        navbarToggle.addEventListener('click', () => {
            navbarMenu.classList.toggle('active');
        });
    }
}

// Initialize Floating Action Buttons
function initFABs() {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollTopBtn.style.display = 'flex';
            } else {
                scrollTopBtn.style.display = 'none';
            }
        });
        
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Show Alert Message
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '10000';
    alertDiv.style.minWidth = '250px';
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format Currency
function formatCurrency(amount) {
    return `NPR ${parseFloat(amount).toLocaleString('en-NP', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

// Calculate Days Between Dates
function calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Close modal on outside click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Loading Spinner
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="spinner"></div>';
    }
}

function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '';
    }
}

// Validate Email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Get Query Parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Set Query Parameters
function setQueryParam(param, value) {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    window.history.pushState({}, '', url);
}

// Debounce Function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for use in other scripts
window.app = {
    API_URL,
    currentUser,
    checkSession,
    logout,
    showAlert,
    formatDate,
    formatCurrency,
    calculateDays,
    openModal,
    closeModal,
    showLoading,
    hideLoading,
    isValidEmail,
    getQueryParam,
    setQueryParam,
    debounce
};
