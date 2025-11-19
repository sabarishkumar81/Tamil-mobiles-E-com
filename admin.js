 // Admin Dashboard Functionality

let allUsers = [];
let filteredUsers = [];

// Initialize admin dashboard with full authentication
function initAdmin() {
    // Full authentication check - verify admin is logged in
    if (!auth.isAdminLoggedIn()) {
        showMessage('Please login to access admin dashboard', 'error');
        setTimeout(() => {
            window.location.href = 'admin-login.html';
        }, 2000);
        return;
    }

    // Verify admin session is valid
    const session = auth.getAdminSession();
    if (!session || session.role !== 'admin') {
        showMessage('Invalid admin session! Please login again.', 'error');
        setTimeout(() => {
            window.location.href = 'admin-login.html';
        }, 2000);
        return;
    }

    // Display admin name
    if (session) {
        document.getElementById('adminName').textContent = `Welcome, ${session.name}`;
    }

    // Load users
    loadUsers();
    updateStats();
    
    // Set up periodic authentication check (every 5 minutes)
    setInterval(() => {
        if (!auth.isAdminLoggedIn()) {
            showMessage('Session expired! Redirecting to login...', 'error');
            setTimeout(() => {
                window.location.href = 'admin-login.html';
            }, 2000);
        }
    }, 300000); // 5 minutes
}

// Load all users
function loadUsers() {
    allUsers = auth.getUsers();
    filteredUsers = [...allUsers];
    renderUsers();
}

// Render users table
function renderUsers() {
    const tbody = document.getElementById('usersTableBody');
    
    if (filteredUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>No users found</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredUsers.map((user, index) => {
        const createdDate = new Date(user.createdAt);
        const formattedDate = createdDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(user.name)}</td>
                <td>${escapeHtml(user.email)}</td>
                <td>${escapeHtml(user.phone)}</td>
                <td>${formattedDate}</td>
                <td>
                    <button class="action-btn btn-view" onclick="showProfile('${user.id}')" title="View full profile details with authentication">
                        <i class="fas fa-eye"></i> Show Profile
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteUser('${user.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter users
function filterUsers() {
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    
    if (!searchTerm) {
        filteredUsers = [...allUsers];
    } else {
        filteredUsers = allUsers.filter(user => 
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.phone.includes(searchTerm)
        );
    }
    
    renderUsers();
}

// Show user profile details with full authentication
function showProfile(userId) {
    // Full authentication check - verify admin is still logged in
    if (!auth.isAdminLoggedIn()) {
        showMessage('Session expired! Please login again.', 'error');
        setTimeout(() => {
            window.location.href = 'admin-login.html';
        }, 2000);
        return;
    }

    // Verify admin session is valid
    const adminSession = auth.getAdminSession();
    if (!adminSession || adminSession.role !== 'admin') {
        showMessage('Unauthorized access! Admin authentication required.', 'error');
        setTimeout(() => {
            window.location.href = 'admin-login.html';
        }, 2000);
        return;
    }

    const user = auth.getUserById(userId);
    
    if (!user) {
        showMessage('User not found!', 'error');
        return;
    }

    const createdDate = new Date(user.createdAt);
    const updatedDate = new Date(user.updatedAt);
    
    // Calculate account age
    const accountAge = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));
    
    const profileHTML = `
        <div class="detail-item" style="background: linear-gradient(135deg, #2874f0, #1a5dc7); color: white; padding: 20px; border-radius: 8px;">
            <label style="color: rgba(255,255,255,0.9);">User ID</label>
            <div class="value" style="color: white; font-size: 18px; font-weight: bold;">${escapeHtml(user.id)}</div>
        </div>
        <div class="detail-item">
            <label>Full Name</label>
            <div class="value" style="font-size: 18px; font-weight: 600; color: #2874f0;">${escapeHtml(user.name)}</div>
        </div>
        <div class="detail-item">
            <label>Email Address</label>
            <div class="value">${escapeHtml(user.email)}</div>
        </div>
        <div class="detail-item">
            <label>Phone Number</label>
            <div class="value">${escapeHtml(user.phone)}</div>
        </div>
        <div class="detail-item">
            <label>Account Created</label>
            <div class="value">${createdDate.toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            })}</div>
        </div>
        <div class="detail-item">
            <label>Last Updated</label>
            <div class="value">${updatedDate.toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            })}</div>
        </div>
        <div class="detail-item">
            <label>Account Age</label>
            <div class="value">${accountAge} day${accountAge !== 1 ? 's' : ''} old</div>
        </div>
        <div class="detail-item" style="background: #f8f9fa; border-left: 4px solid #28a745;">
            <label>Account Status</label>
            <div class="value" style="color: #28a745; font-weight: 600;">
                <i class="fas fa-check-circle"></i> Active
            </div>
        </div>
    `;

    document.getElementById('profileDetails').innerHTML = profileHTML;
    document.getElementById('profileModal').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('profileModal').classList.remove('active');
}

// Delete user with authentication check
function deleteUser(userId) {
    // Full authentication check
    if (!auth.isAdminLoggedIn()) {
        showMessage('Session expired! Please login again.', 'error');
        setTimeout(() => {
            window.location.href = 'admin-login.html';
        }, 2000);
        return;
    }

    const adminSession = auth.getAdminSession();
    if (!adminSession || adminSession.role !== 'admin') {
        showMessage('Unauthorized access! Admin authentication required.', 'error');
        setTimeout(() => {
            window.location.href = 'admin-login.html';
        }, 2000);
        return;
    }

    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }

    if (auth.deleteUser(userId)) {
        showMessage('User deleted successfully!', 'success');
        loadUsers();
        updateStats();
    } else {
        showMessage('Failed to delete user!', 'error');
    }
}

// Update statistics
function updateStats() {
    const stats = auth.getStats();
    document.getElementById('totalUsers').textContent = stats.total;
    document.getElementById('newUsers').textContent = stats.newThisMonth;
    document.getElementById('todayUsers').textContent = stats.today;
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        auth.adminLogout();
        window.location.href = 'admin-login.html';
    }
}

// Show message
function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type} show`;
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 5000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('profileModal');
    if (e.target === modal) {
        closeModal();
    }
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initAdmin);

