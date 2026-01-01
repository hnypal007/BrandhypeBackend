// API Configuration
const API_URL = '/api';

// State Management
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    if (authToken && currentUser) {
        showDashboard();
    } else {
        showLogin();
    }
    
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Login Form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Create Case Form
    document.getElementById('createCaseForm').addEventListener('submit', handleCreateCase);
    
    // Create User Form
    document.getElementById('createUserForm').addEventListener('submit', handleCreateUser);
    
    // Tech Update Form
    document.getElementById('techUpdateForm').addEventListener('submit', handleTechUpdate);
    
    // Refresh Buttons
    document.getElementById('refreshCases')?.addEventListener('click', loadTechCases);
    document.getElementById('refreshAdminCases')?.addEventListener('click', loadAdminCases);
    
    // Export Button
    document.getElementById('exportExcel')?.addEventListener('click', handleExportExcel);
    
    // Tab Buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            switchTab(tabName);
        });
    });
}

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            errorDiv.textContent = data.msg || 'Login failed';
            errorDiv.classList.add('show');
            return;
        }
        
        authToken = data.token;
        currentUser = data.user;
        
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showDashboard();
    } catch (error) {
        errorDiv.textContent = 'Network error. Please try again.';
        errorDiv.classList.add('show');
        console.error('Login error:', error);
    }
}

function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    showLogin();
}

// Page Navigation
function showLogin() {
    document.getElementById('loginPage').classList.add('active');
    document.getElementById('dashboardPage').classList.remove('active');
}

function showDashboard() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('dashboardPage').classList.add('active');
    
    // Update user info
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = currentUser.role;
    
    // Show appropriate view based on role
    document.getElementById('agentView').classList.remove('active');
    document.getElementById('techView').classList.remove('active');
    document.getElementById('adminView').classList.remove('active');
    
    if (currentUser.role === 'AGENT') {
        document.getElementById('agentView').classList.add('active');
        document.getElementById('dashboardTitle').textContent = 'Agent Dashboard';
    } else if (currentUser.role === 'TECH') {
        document.getElementById('techView').classList.add('active');
        document.getElementById('dashboardTitle').textContent = 'Tech Dashboard';
        loadTechCases();
    } else if (currentUser.role === 'ADMIN') {
        document.getElementById('adminView').classList.add('active');
        document.getElementById('dashboardTitle').textContent = 'Admin Dashboard';
        loadAdminCases();
    }
}

// Case Management Functions
async function handleCreateCase(e) {
    e.preventDefault();
    
    const formData = {
        agentName: document.getElementById('agentName').value,
        cxName: document.getElementById('cxName').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        device: document.getElementById('device').value,
        model: document.getElementById('model').value,
        isp: document.getElementById('isp').value,
        services: document.getElementById('services').value,
        amount: document.getElementById('amount').value,
        paymentMode: document.getElementById('paymentMode').value,
        cardNumber: document.getElementById('cardNumber').value,
        caseId: document.getElementById('caseId').value,
        issue: document.getElementById('issue').value,
        remark: document.getElementById('remark').value
    };
    
    // Remove empty fields
    Object.keys(formData).forEach(key => {
        if (!formData[key]) delete formData[key];
    });
    
    const messageDiv = document.getElementById('caseMessage');
    
    try {
        const response = await fetch(`${API_URL}/case/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': authToken
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            messageDiv.textContent = data.msg || 'Failed to create case';
            messageDiv.className = 'message error';
            return;
        }
        
        messageDiv.textContent = 'Case created successfully!';
        messageDiv.className = 'message success';
        document.getElementById('createCaseForm').reset();
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    } catch (error) {
        messageDiv.textContent = 'Network error. Please try again.';
        messageDiv.className = 'message error';
        console.error('Create case error:', error);
    }
}

async function loadTechCases() {
    try {
        const response = await fetch(`${API_URL}/case/tech`, {
            headers: { 'x-auth-token': authToken }
        });
        
        const cases = await response.json();
        
        const container = document.getElementById('casesList');
        
        if (!cases || cases.length === 0) {
            container.innerHTML = '<p style="padding: 2rem; text-align: center; color: var(--text-muted);">No cases found</p>';
            return;
        }
        
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Customer Name</th>
                        <th>Phone</th>
                        <th>Issue</th>
                        <th>Status</th>
                        <th>Issue Fixed</th>
                        <th>Created</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${cases.map(c => `
                        <tr>
                            <td>${c.cxName || 'N/A'}</td>
                            <td>${c.phone || 'N/A'}</td>
                            <td>${c.issue || 'N/A'}</td>
                            <td><span class="status-badge status-${c.status?.toLowerCase() || 'pending'}">${c.status || 'PENDING'}</span></td>
                            <td>${c.issueFixed ? '✓ Yes' : '✗ No'}</td>
                            <td>${new Date(c.createdAt).toLocaleDateString()}</td>
                            <td><button class="btn btn-primary action-btn" onclick="openCaseDetail('${c._id}')">View/Update</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Load cases error:', error);
        document.getElementById('casesList').innerHTML = '<p style="padding: 2rem; color: var(--error);">Failed to load cases</p>';
    }
}

async function loadAdminCases() {
    try {
        const response = await fetch(`${API_URL}/admin/all-cases`, {
            headers: { 'x-auth-token': authToken }
        });
        
        const cases = await response.json();
        
        const container = document.getElementById('adminCasesList');
        
        if (!cases || cases.length === 0) {
            container.innerHTML = '<p style="padding: 2rem; text-align: center; color: var(--text-muted);">No cases found</p>';
            return;
        }
        
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Device</th>
                        <th>Issue</th>
                        <th>Amount</th>
                        <th>Card Number</th>
                        <th>Status</th>
                        <th>Fixed</th>
                        <th>Created</th>
                    </tr>
                </thead>
                <tbody>
                    ${cases.map(c => `
                        <tr>
                            <td>${c.cxName || 'N/A'}</td>
                            <td>${c.phone || 'N/A'}</td>
                            <td>${c.email || 'N/A'}</td>
                            <td>${c.device || 'N/A'}</td>
                            <td>${c.issue || 'N/A'}</td>
                            <td>${c.amount ? '₹' + c.amount : 'N/A'}</td>
                            <td>${c.cardNumber || 'N/A'}</td>
                            <td><span class="status-badge status-${c.status?.toLowerCase() || 'pending'}">${c.status || 'PENDING'}</span></td>
                            <td>${c.issueFixed ? '✓' : '✗'}</td>
                            <td>${new Date(c.createdAt).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Load admin cases error:', error);
        document.getElementById('adminCasesList').innerHTML = '<p style="padding: 2rem; color: var(--error);">Failed to load cases</p>';
    }
}

// User Management
async function handleCreateUser(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('newUserName').value,
        username: document.getElementById('newUsername').value,
        password: document.getElementById('newPassword').value,
        role: document.getElementById('newUserRole').value
    };
    
    const messageDiv = document.getElementById('userMessage');
    
    try {
        const response = await fetch(`${API_URL}/admin/create-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': authToken
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            messageDiv.textContent = data.msg || 'Failed to create user';
            messageDiv.className = 'message error';
            return;
        }
        
        messageDiv.textContent = 'User created successfully!';
        messageDiv.className = 'message success';
        document.getElementById('createUserForm').reset();
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    } catch (error) {
        messageDiv.textContent = 'Network error. Please try again.';
        messageDiv.className = 'message error';
        console.error('Create user error:', error);
    }
}

// Export Excel
async function handleExportExcel() {
    const messageDiv = document.getElementById('exportMessage');
    
    try {
        const response = await fetch(`${API_URL}/admin/export-excel`, {
            headers: { 'x-auth-token': authToken }
        });
        
        if (!response.ok) {
            messageDiv.textContent = 'Failed to export data';
            messageDiv.className = 'message error';
            return;
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cases-export-${Date.now()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        messageDiv.textContent = 'Export successful!';
        messageDiv.className = 'message success';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    } catch (error) {
        messageDiv.textContent = 'Export failed. Please try again.';
        messageDiv.className = 'message error';
        console.error('Export error:', error);
    }
}

// Tab Switching
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// Modal Functions
let currentCaseData = null;

async function openCaseDetail(caseId) {
    try {
        const response = await fetch(`${API_URL}/case/tech`, {
            headers: { 'x-auth-token': authToken }
        });
        
        const cases = await response.json();
        const caseData = cases.find(c => c._id === caseId);
        
        if (!caseData) {
            alert('Case not found');
            return;
        }
        
        currentCaseData = caseData;
        
        const content = document.getElementById('caseDetailContent');
        content.innerHTML = `
            <div class="detail-row">
                <div class="detail-label">Customer Name:</div>
                <div class="detail-value">${caseData.cxName || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Phone:</div>
                <div class="detail-value">${caseData.phone || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Email:</div>
                <div class="detail-value">${caseData.email || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Address:</div>
                <div class="detail-value">${caseData.address || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Device:</div>
                <div class="detail-value">${caseData.device || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Model:</div>
                <div class="detail-value">${caseData.model || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">ISP:</div>
                <div class="detail-value">${caseData.isp || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Services:</div>
                <div class="detail-value">${caseData.services || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Amount:</div>
                <div class="detail-value">${caseData.amount ? '₹' + caseData.amount : 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Payment Mode:</div>
                <div class="detail-value">${caseData.paymentMode || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Issue:</div>
                <div class="detail-value">${caseData.issue || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Remark:</div>
                <div class="detail-value">${caseData.remark || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Status:</div>
                <div class="detail-value"><span class="status-badge status-${caseData.status?.toLowerCase() || 'pending'}">${caseData.status || 'PENDING'}</span></div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Issue Fixed:</div>
                <div class="detail-value">${caseData.issueFixed ? '✓ Yes' : '✗ No'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Tech Remark:</div>
                <div class="detail-value">${caseData.techRemark || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Created:</div>
                <div class="detail-value">${new Date(caseData.createdAt).toLocaleString()}</div>
            </div>
        `;
        
        document.getElementById('updateCaseId').value = caseId;
        document.getElementById('techRemark').value = caseData.techRemark || '';
        document.getElementById('issueFixed').value = caseData.issueFixed ? 'true' : 'false';
        
        document.getElementById('caseModal').classList.add('active');
    } catch (error) {
        console.error('Error loading case details:', error);
        alert('Failed to load case details');
    }
}

function closeModal() {
    document.getElementById('caseModal').classList.remove('active');
    document.getElementById('updateMessage').style.display = 'none';
}

async function handleTechUpdate(e) {
    e.preventDefault();
    
    const caseId = document.getElementById('updateCaseId').value;
    const techRemark = document.getElementById('techRemark').value;
    const issueFixed = document.getElementById('issueFixed').value === 'true';
    
    const messageDiv = document.getElementById('updateMessage');
    
    try {
        const response = await fetch(`${API_URL}/case/tech/fix/${caseId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': authToken
            },
            body: JSON.stringify({ issueFixed, techRemark })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            messageDiv.textContent = data.msg || 'Failed to update case';
            messageDiv.className = 'message error';
            return;
        }
        
        messageDiv.textContent = data.msg || 'Case updated successfully!';
        messageDiv.className = 'message success';
        
        setTimeout(() => {
            closeModal();
            loadTechCases();
        }, 1500);
    } catch (error) {
        messageDiv.textContent = 'Network error. Please try again.';
        messageDiv.className = 'message error';
        console.error('Update case error:', error);
    }
}

// Make functions globally available
window.openCaseDetail = openCaseDetail;
window.closeModal = closeModal;

