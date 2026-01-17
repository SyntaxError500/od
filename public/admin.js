const API_BASE_URL = window.location.origin + '/api';
let authToken = null;

function showMessage(text, type) {
    const msgEl = document.getElementById('message');
    msgEl.textContent = text;
    msgEl.className = `message ${type}`;
    setTimeout(() => {
        msgEl.className = 'message';
    }, 5000);
}

async function adminLogin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (data.token) {
            authToken = data.token;
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            loadAllData();
        } else {
            showMessage('Login failed', 'error');
        }
    } catch (error) {
        showMessage('Login error: ' + error.message, 'error');
    }
}

function logout() {
    authToken = null;
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
}

function switchTab(tabName, clickedTab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    if (clickedTab) {
        clickedTab.classList.add('active');
    } else {
        // Fallback: find tab by data-tab attribute
        const tab = document.querySelector(`.tab[data-tab="${tabName}"]`);
        if (tab) tab.classList.add('active');
    }
    document.getElementById(tabName).classList.add('active');
    
    if (tabName === 'pending') loadPendingTeams();
    if (tabName === 'teams') loadAllTeams();
    if (tabName === 'leaderboard') loadLeaderboard();
}

async function loadPendingTeams() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/pending-teams`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        const listEl = document.getElementById('pendingTeamsList');
        listEl.innerHTML = '';

        if (data.teams.length === 0) {
            listEl.innerHTML = '<p>No pending teams</p>';
            return;
        }

        data.teams.forEach(team => {
            const card = document.createElement('div');
            card.className = 'team-card';
            card.innerHTML = `
                <div class="team-info">
                    <h3>${team.teamName}</h3>
                    <p>Leader: ${team.leaderName} | Username: ${team.username}</p>
                    <p>Email: ${team.email || 'N/A'} | Phone: ${team.phone || 'N/A'}</p>
                </div>
                <button class="btn btn-approve" data-team-id="${team._id}">Approve</button>
            `;
            const approveBtn = card.querySelector('.btn-approve');
            approveBtn.addEventListener('click', () => approveTeam(team._id));
            listEl.appendChild(card);
        });
    } catch (error) {
        showMessage('Error loading pending teams', 'error');
    }
}

async function approveTeam(teamId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/approve-team/${teamId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        if (response.ok) {
            showMessage('Team approved successfully', 'success');
            loadPendingTeams();
            loadAllTeams();
        } else {
            showMessage(data.error || 'Error approving team', 'error');
        }
    } catch (error) {
        showMessage('Error approving team', 'error');
    }
}

async function loadAllTeams() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/teams`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        const listEl = document.getElementById('allTeamsList');
        listEl.innerHTML = '';

        data.teams.forEach(team => {
            const card = document.createElement('div');
            card.className = 'team-card';
            card.innerHTML = `
                <div class="team-info">
                    <h3>${team.teamName} ${team.approved ? '✓' : '(Pending)'}</h3>
                    <p>Leader: ${team.leaderName} | Score: ${team.score} points</p>
                    <p>Status: ${team.activeToken ? '🟢 Logged In' : '🔴 Logged Out'}</p>
                </div>
                <button class="btn btn-logout-team" data-team-id="${team._id}" data-team-name="${team.teamName}">Force Logout</button>
            `;
            const logoutBtn = card.querySelector('.btn-logout-team');
            logoutBtn.addEventListener('click', () => forceLogoutTeam(team._id, team.teamName));
            listEl.appendChild(card);
        });
    } catch (error) {
        showMessage('Error loading teams', 'error');
    }
}

async function forceLogoutTeam(teamId, teamName) {
    if (!confirm(`Are you sure you want to force logout team "${teamName}"?`)) {
        return;
    }

    try {
        console.log('Attempting to force logout team:', teamId, teamName);
        const response = await fetch(`${API_BASE_URL}/admin/force-logout/${teamId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response data:', data);
        
        if (response.ok) {
            showMessage(`Team "${teamName}" has been force logged out`, 'success');
            loadAllTeams();
        } else {
            showMessage(data.error || `Error forcing logout (${response.status})`, 'error');
        }
    } catch (error) {
        console.error('Force logout error:', error);
        showMessage('Error forcing logout: ' + error.message, 'error');
    }
}

async function uploadLocationHints() {
    const round = document.getElementById('roundNumber').value;
    const hintsText = document.getElementById('locationHints').value;
    const hints = hintsText.split('\n').filter(h => h.trim());

    try {
        const response = await fetch(`${API_BASE_URL}/admin/location-hints`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ round, hints })
        });

        if (response.ok) {
            showMessage('Location hints uploaded successfully', 'success');
            document.getElementById('locationHints').value = '';
        } else {
            showMessage('Error uploading hints', 'error');
        }
    } catch (error) {
        showMessage('Error uploading hints', 'error');
    }
}

let qrCodeCounter = 0;
const qrCodes = {};

function addQRCodeForm() {
    const container = document.getElementById('newQRCodes');
    const id = 'qr_' + qrCodeCounter++;
    const form = document.createElement('div');
    form.className = 'qr-code-form';
    form.id = id;
    form.innerHTML = `
        <h4>New QR Code</h4>
        <div class="form-group">
            <label>QR Key (unique identifier)</label>
            <input type="text" id="${id}_key" placeholder="e.g., location1_round1">
        </div>
        <div class="form-group">
            <label>Number</label>
            <input type="text" id="${id}_number" placeholder="e.g., LOC001">
        </div>
        <div class="form-group">
            <label>Value (for matching)</label>
            <input type="text" id="${id}_value" placeholder="Unique value">
        </div>
        <div class="form-group">
            <label>Question</label>
            <textarea id="${id}_question" placeholder="Enter the question"></textarea>
        </div>
        <div class="form-group">
            <label>Answer</label>
            <input type="text" id="${id}_answer" placeholder="Correct answer">
        </div>
        <div class="form-group">
            <label>Time (minutes)</label>
            <input type="number" id="${id}_time" value="5" min="1">
        </div>
        <div class="form-group">
            <label>Points</label>
            <input type="number" id="${id}_points" value="50" min="1">
        </div>
        <div class="form-group">
            <label>Max Scans</label>
            <input type="number" id="${id}_maxScans" value="10" min="1">
        </div>
        <div class="form-group">
            <label>Question Image Name (optional)</label>
            <input type="text" id="${id}_queimagename" placeholder="image.jpg">
        </div>
        <button class="btn-remove" data-form-id="${id}">Remove</button>
    `;
    const removeBtn = form.querySelector('.btn-remove');
    removeBtn.addEventListener('click', () => removeQRCodeForm(id));
    container.appendChild(form);
}

function removeQRCodeForm(id) {
    document.getElementById(id).remove();
}

async function uploadQRCodes() {
    const forms = document.querySelectorAll('.qr-code-form');
    const qrcodes = {};

    forms.forEach(form => {
        const id = form.id;
        const keyInput = document.getElementById(id + '_key');
        if (!keyInput || !keyInput.value) return;

        qrcodes[keyInput.value] = {
            number: document.getElementById(id + '_number').value,
            value: document.getElementById(id + '_value').value,
            question: document.getElementById(id + '_question').value,
            answer: document.getElementById(id + '_answer').value,
            time: document.getElementById(id + '_time').value,
            points: parseInt(document.getElementById(id + '_points').value),
            maxScans: parseInt(document.getElementById(id + '_maxScans').value),
            scans: 0,
            queimagename: document.getElementById(id + '_queimagename').value || ''
        };
    });

    try {
        const response = await fetch(`${API_BASE_URL}/admin/qrcodes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ qrcodes })
        });

        if (response.ok) {
            showMessage('QR codes uploaded successfully', 'success');
            document.getElementById('newQRCodes').innerHTML = '';
            qrCodeCounter = 0;
        } else {
            showMessage('Error uploading QR codes', 'error');
        }
    } catch (error) {
        showMessage('Error uploading QR codes', 'error');
    }
}

async function loadLeaderboard() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/leaderboard`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        const listEl = document.getElementById('leaderboardList');
        listEl.innerHTML = '';

        data.teams.forEach((team, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <div class="rank">${index + 1}</div>
                <div class="team-name">${team.teamName}</div>
                <div class="team-score">${team.score} pts</div>
            `;
            listEl.appendChild(item);
        });
    } catch (error) {
        showMessage('Error loading leaderboard', 'error');
    }
}

function loadAllData() {
    loadPendingTeams();
    loadAllTeams();
    loadLeaderboard();
}

// Event listeners setup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Login button
    const loginBtn = document.querySelector('#loginSection button');
    if (loginBtn) {
        loginBtn.addEventListener('click', adminLogin);
    }

    // Logout button
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            if (tabName) {
                switchTab(tabName, tab);
            }
        });
    });

    // Upload location hints button
    const uploadHintsBtn = document.querySelector('#hints .btn-add');
    if (uploadHintsBtn) {
        uploadHintsBtn.addEventListener('click', uploadLocationHints);
    }

    // Add QR code button - first btn-add in qrcodes section
    const qrcodesSection = document.getElementById('qrcodes');
    if (qrcodesSection) {
        const addQRBtn = qrcodesSection.querySelector('.btn-add:not(.btn-upload-all)');
        if (addQRBtn) {
            addQRBtn.addEventListener('click', addQRCodeForm);
        }
    }

    // Upload QR codes button
    const uploadQRCodesBtn = document.querySelector('.btn-upload-all');
    if (uploadQRCodesBtn) {
        uploadQRCodesBtn.addEventListener('click', uploadQRCodes);
    }
});

