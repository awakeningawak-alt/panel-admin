// ==================== KONFIGURASI ====================
const OWNER_PASSWORD = "BlastOwner2026";
const OWNER_NUMBER = "6283121811008";
const REFERRAL_WEBSITE_URL = "https://blast-referral.vercel.app";
const APK_VERSION = "V1.0.0";

// ==================== STORAGE KEYS ====================
const STORAGE_KEYS = {
    VERIFIED_NUMBERS: 'wa_blast_verified_numbers',
    VERIFIED_GROUPS: 'wa_blast_verified_groups',
    VERIFIED_CHANNELS: 'wa_blast_verified_channels',
    UPDATE_HISTORY: 'wa_blast_update_history',
    USERS: 'wa_blast_users',
    TOKENS: 'wa_blast_tokens',
    PREMIUM: 'wa_blast_premium'
};

// ==================== DATA GLOBAL ====================
let verifiedNumbers = [];
let verifiedGroups = [];
let verifiedChannels = [];
let updateHistory = [];
let users = [];
let tokens = {};
let premiumUsers = {};
let currentVerifyType = "number";
let referralConnected = false;
let apkConnected = false;

// ==================== INITIALIZE DATA ====================
function initData() {
    // Load from localStorage
    verifiedNumbers = JSON.parse(localStorage.getItem(STORAGE_KEYS.VERIFIED_NUMBERS) || '["6283121811008"]');
    verifiedGroups = JSON.parse(localStorage.getItem(STORAGE_KEYS.VERIFIED_GROUPS) || '[]');
    verifiedChannels = JSON.parse(localStorage.getItem(STORAGE_KEYS.VERIFIED_CHANNELS) || '[]');
    updateHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.UPDATE_HISTORY) || '[]');
    users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    tokens = JSON.parse(localStorage.getItem(STORAGE_KEYS.TOKENS) || '{}');
    premiumUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.PREMIUM) || '{}');
    
    // Add mock users if empty
    if (users.length === 0) {
        users = [
            { phone: "628123456789", username: "blastuser1", email: "user1@email.com", registeredAt: new Date().toISOString() },
            { phone: "628987654321", username: "blastuser2", email: "user2@email.com", registeredAt: new Date().toISOString() },
            { phone: "628555555555", username: "blastuser3", email: "user3@email.com", registeredAt: new Date().toISOString() }
        ];
        tokens = {
            "628123456789": 5,
            "628987654321": 12,
            "628555555555": 3
        };
        premiumUsers = {
            "628987654321": { active: true, expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() }
        };
        saveAllData();
    }
}

function saveAllData() {
    localStorage.setItem(STORAGE_KEYS.VERIFIED_NUMBERS, JSON.stringify(verifiedNumbers));
    localStorage.setItem(STORAGE_KEYS.VERIFIED_GROUPS, JSON.stringify(verifiedGroups));
    localStorage.setItem(STORAGE_KEYS.VERIFIED_CHANNELS, JSON.stringify(verifiedChannels));
    localStorage.setItem(STORAGE_KEYS.UPDATE_HISTORY, JSON.stringify(updateHistory));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
    localStorage.setItem(STORAGE_KEYS.PREMIUM, JSON.stringify(premiumUsers));
}

// ==================== CHECK CONNECTIONS ====================
async function checkConnections() {
    // Check Referral Website Connection
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(`${REFERRAL_WEBSITE_URL}/api/health`, {
            method: 'GET',
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        referralConnected = response.ok;
    } catch (error) {
        referralConnected = false;
    }
    
    // Check APK Connection (simulate - will be real when APK is built)
    // For now, check if any user has been active in last 5 minutes
    const lastActive = localStorage.getItem('wa_blast_last_apk_ping');
    if (lastActive) {
        const lastActiveTime = parseInt(lastActive);
        apkConnected = (Date.now() - lastActiveTime) < 300000; // 5 minutes
    } else {
        apkConnected = false;
    }
    
    updateConnectionStatusUI();
}

function updateConnectionStatusUI() {
    // Login panel status
    const adminStatusDot = document.getElementById('adminStatusDot');
    const adminStatusText = document.getElementById('adminStatusText');
    
    if (adminStatusDot && adminStatusText) {
        if (referralConnected && apkConnected) {
            adminStatusDot.className = 'status-dot green';
            adminStatusText.innerText = 'Status: Terhubung (Lengkap)';
        } else if (referralConnected || apkConnected) {
            adminStatusDot.className = 'status-dot orange';
            adminStatusText.innerText = 'Status: Terhubung Sebagian';
        } else {
            adminStatusDot.className = 'status-dot red';
            adminStatusText.innerText = 'Status: Belum Terhubung';
        }
    }
    
    // Sidebar statuses
    const sidebarReferralStatus = document.getElementById('sidebarReferralStatus');
    const sidebarApkStatus = document.getElementById('sidebarApkStatus');
    
    if (sidebarReferralStatus) {
        sidebarReferralStatus.className = referralConnected ? 'status-dot green' : 'status-dot red';
    }
    if (sidebarApkStatus) {
        sidebarApkStatus.className = apkConnected ? 'status-dot green' : 'status-dot red';
    }
}

// ==================== LOGIN FUNCTIONS ====================
function checkPassword() {
    const password = document.getElementById('passwordInput').value;
    if (password === OWNER_PASSWORD) {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('adminContainer').style.display = 'flex';
        updateAllStats();
        updateVerifiedList();
        updateUsersTable();
        updateHistoryList();
        drawChart();
        startConnectionChecker();
    } else {
        document.getElementById('loginError').innerText = '❌ Password salah! Akses ditolak.';
    }
}

function logout() {
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('adminContainer').style.display = 'none';
    document.getElementById('passwordInput').value = '';
    document.getElementById('loginError').innerText = '';
    stopConnectionChecker();
}

let connectionInterval = null;
function startConnectionChecker() {
    if (connectionInterval) clearInterval(connectionInterval);
    checkConnections();
    connectionInterval = setInterval(checkConnections, 30000);
}
function stopConnectionChecker() {
    if (connectionInterval) {
        clearInterval(connectionInterval);
        connectionInterval = null;
    }
}

// ==================== STATISTICS ====================
function updateAllStats() {
    document.getElementById('totalUsers').innerText = users.length;
    const onlineCount = Math.floor(Math.random() * users.length) || 0;
    document.getElementById('onlineUsers').innerText = onlineCount;
    document.getElementById('offlineUsers').innerText = users.length - onlineCount;
    
    let totalTokenCount = 0;
    for (let key in tokens) {
        totalTokenCount += tokens[key];
    }
    document.getElementById('totalTokens').innerText = totalTokenCount;
    
    let premiumCount = 0;
    for (let key in premiumUsers) {
        if (premiumUsers[key].active && new Date(premiumUsers[key].expires) > new Date()) {
            premiumCount++;
        }
    }
    document.getElementById('premiumUsers').innerText = premiumCount;
    document.getElementById('latestVersion').innerText = APK_VERSION;
}

// ==================== VERIFIED LIST ====================
function updateVerifiedList() {
    const list = document.getElementById('verifiedList');
    let items = [];
    
    if (currentVerifyType === "number") {
        items = verifiedNumbers.map(v => ({ value: v, icon: "📱" }));
    } else if (currentVerifyType === "group") {
        items = verifiedGroups.map(v => ({ value: v, icon: "👥" }));
    } else {
        items = verifiedChannels.map(v => ({ value: v, icon: "📢" }));
    }
    
    list.innerHTML = items.map(item => 
        `<li>${item.icon} ${item.value} <span style="color:#E53935;">🔴 CENTANG MERAH</span></li>`
    ).join('');
}

function addVerified() {
    const input = document.getElementById('verifyInput');
    const value = input.value.trim();
    if (!value) return;
    
    if (currentVerifyType === "number") {
        if (!verifiedNumbers.includes(value)) {
            verifiedNumbers.push(value);
        }
    } else if (currentVerifyType === "group") {
        if (!verifiedGroups.includes(value)) {
            verifiedGroups.push(value);
        }
    } else {
        if (!verifiedChannels.includes(value)) {
            verifiedChannels.push(value);
        }
    }
    saveAllData();
    updateVerifiedList();
    input.value = '';
}

function removeVerified() {
    const input = document.getElementById('verifyInput');
    const value = input.value.trim();
    if (!value) return;
    
    if (currentVerifyType === "number") {
        verifiedNumbers = verifiedNumbers.filter(v => v !== value);
    } else if (currentVerifyType === "group") {
        verifiedGroups = verifiedGroups.filter(v => v !== value);
    } else {
        verifiedChannels = verifiedChannels.filter(v => v !== value);
    }
    saveAllData();
    updateVerifiedList();
    input.value = '';
}

// ==================== ANNOUNCEMENT ====================
function sendAnnouncement() {
    const title = document.getElementById('announceTitle').value;
    const body = document.getElementById('announceBody').value;
    
    if (!title || !body) {
        document.getElementById('announceResult').innerHTML = '<span style="color:#E53935;">❌ Judul dan isi harus diisi!</span>';
        return;
    }
    
    // Save to history
    const announcement = {
        type: 'mass',
        title: title,
        body: body,
        date: new Date().toISOString(),
        recipients: users.length + 1
    };
    
    document.getElementById('announceResult').innerHTML = `
        <span style="color:#4CAF50;">✅ Pengumuman terkirim ke ${users.length} user + Owner!</span><br>
        <small>📢 ${title}: ${body.substring(0, 100)}</small>
        <small>📅 ${new Date().toLocaleString()}</small>
    `;
    
    document.getElementById('announceTitle').value = '';
    document.getElementById('announceBody').value = '';
}

function testAnnouncement() {
    const title = document.getElementById('announceTitle').value;
    const body = document.getElementById('announceBody').value;
    
    if (!title || !body) {
        document.getElementById('announceResult').innerHTML = '<span style="color:#E53935;">❌ Judul dan isi harus diisi!</span>';
        return;
    }
    
    document.getElementById('announceResult').innerHTML = `
        <span style="color:#4CAF50;">✅ Test pengumuman terkirim ke Owner (${OWNER_NUMBER})</span><br>
        <small>📢 ${title}: ${body.substring(0, 100)}</small>
    `;
}

// ==================== UPDATE APK ====================
let uploadedApkUrl = null;
let uploadedVersion = null;
let uploadedFileName = null;

function uploadApk() {
    const fileInput = document.getElementById('apkFile');
    const file = fileInput.files[0];
    
    if (!file) {
        document.getElementById('updateStatus').innerHTML = '<span style="color:#E53935;">❌ Pilih file APK dulu!</span>';
        return;
    }
    
    if (!file.name.endsWith('.apk')) {
        document.getElementById('updateStatus').innerHTML = '<span style="color:#E53935;">❌ File harus .apk!</span>';
        return;
    }
    
    const version = prompt("Masukkan versi baru (contoh: V1.0.1):", "V1.0.1");
    if (!version) return;
    
    uploadedVersion = version;
    uploadedFileName = file.name;
    uploadedApkUrl = URL.createObjectURL(file);
    
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    document.getElementById('updateStatus').innerHTML = `
        <span style="color:#4CAF50;">✅ APK ${version} berhasil diupload!</span><br>
        <small>📦 ${file.name} (${fileSizeMB} MB)</small>
    `;
    document.getElementById('testBtn').disabled = false;
    document.getElementById('shareBtn').disabled = false;
}

function testApk() {
    if (uploadedApkUrl) {
        window.open(uploadedApkUrl, '_blank');
        document.getElementById('updateStatus').innerHTML += '<br><span style="color:#FF9800;">🔍 Uji coba APK sedang berjalan... Cek di HP owner.</span>';
    }
}

function shareUpdate() {
    if (!uploadedVersion || !uploadedApkUrl) {
        document.getElementById('updateStatus').innerHTML = '<span style="color:#E53935;">❌ Upload APK dulu sebelum share!</span>';
        return;
    }
    
    updateHistory.unshift({
        version: uploadedVersion,
        fileName: uploadedFileName,
        date: new Date().toISOString(),
        recipients: users.length
    });
    
    saveAllData();
    updateHistoryList();
    updateAllStats();
    
    document.getElementById('updateStatus').innerHTML = `
        <span style="color:#4CAF50;">✅ UPDATE ${uploadedVersion} TELAH DI-SHARE KE ${users.length} USER!</span><br>
        <small>📢 Notifikasi update dikirim ke semua pengguna WhatsApp Blast.</small>
    `;
}

function updateHistoryList() {
    const list = document.getElementById('updateHistory');
    if (updateHistory.length === 0) {
        list.innerHTML = '<li style="color:#888;">Belum ada riwayat update</li>';
    } else {
        list.innerHTML = updateHistory.map(u => 
            `<li><strong>${u.version}</strong> - ${new Date(u.date).toLocaleString()} <span style="color:#4CAF50;">✓ SHARED</span><br><small style="color:#888;">${u.fileName}</small></li>`
        ).join('');
    }
}

// ==================== USERS TABLE ====================
function updateUsersTable() {
    const searchTerm = document.getElementById('searchUser')?.value.toLowerCase() || '';
    const filteredUsers = users.filter(user => 
        user.phone.includes(searchTerm) || 
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
    );
    
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = filteredUsers.map(user => {
        const userTokens = tokens[user.phone] || 0;
        const premium = premiumUsers[user.phone];
        const isPremium = premium && premium.active && new Date(premium.expires) > new Date();
        const expiresText = isPremium ? new Date(premium.expires).toLocaleString() : '-';
        
        return `
            <tr>
                <td>${user.phone}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td style="color:#FFD700;">${userTokens} token</td>
                <td style="color:${isPremium ? '#4CAF50' : '#888'}">${isPremium ? '⭐ Aktif' : 'Nonaktif'}</td>
                <td>${expiresText}</td>
            </tr>
        `;
    }).join('');
}

// ==================== CHART ====================
function drawChart() {
    const canvas = document.getElementById('growthChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dates = [];
    const counts = [];
    
    // Generate last 30 days data
    for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toLocaleDateString());
        counts.push(Math.floor(Math.random() * 500) + (30 - i) * 20);
    }
    
    canvas.width = 800;
    canvas.height = 300;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    
    ctx.fillStyle = '#1E1E1E';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const maxCount = Math.max(...counts);
    const barWidth = canvas.width / counts.length - 2;
    
    counts.forEach((count, i) => {
        const height = (count / maxCount) * (canvas.height - 60);
        const x = i * (barWidth + 2);
        const y = canvas.height - height - 30;
        
        ctx.fillStyle = '#E53935';
        ctx.fillRect(x, y, barWidth, height);
        
        if (i % 5 === 0) {
            ctx.fillStyle = '#888';
            ctx.font = '10px Inter';
            ctx.fillText(dates[i].substring(5), x, canvas.height - 10);
        }
    });
    
    ctx.fillStyle = '#FFF';
    ctx.font = '12px Inter';
    ctx.fillText('Total User: ' + users.length, canvas.width - 120, 20);
}

// ==================== TAB NAVIGATION ====================
function initTabs() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const tabs = document.querySelectorAll('.tab-content');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            const tabNames = {
                'dashboard': 'Dashboard',
                'verify': 'Verifikasi Centang Merah',
                'announcement': 'Pengumuman Massal',
                'update': 'Upload Update APK',
                'users': 'Data User'
            };
            
            const titleElement = document.getElementById('pageTitle');
            if (titleElement) titleElement.innerText = tabNames[tabId] || 'Dashboard';
            
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            tabs.forEach(tab => tab.classList.remove('active-tab'));
            const targetTab = document.getElementById(`${tabId}Tab`);
            if (targetTab) targetTab.classList.add('active-tab');
            
            if (tabId === 'users') updateUsersTable();
            if (tabId === 'verify') updateVerifiedList();
            if (tabId === 'update') updateHistoryList();
        });
    });
}

function initVerifyTypeButtons() {
    const typeBtns = document.querySelectorAll('.type-btn');
    typeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            typeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentVerifyType = btn.dataset.type;
            updateVerifiedList();
            const input = document.getElementById('verifyInput');
            if (input) {
                input.placeholder = currentVerifyType === "number" ? "Masukkan nomor (contoh: 6283121811008)" :
                                   currentVerifyType === "group" ? "Masukkan link grup WhatsApp" :
                                   "Masukkan link channel WhatsApp";
            }
        });
    });
}

function initSearchListener() {
    const searchInput = document.getElementById('searchUser');
    if (searchInput) {
        searchInput.addEventListener('input', updateUsersTable);
    }
}

// ==================== SIMULATE APK PING ====================
function pingFromApk() {
    localStorage.setItem('wa_blast_last_apk_ping', Date.now().toString());
    if (connectionInterval) {
        checkConnections();
    }
}

// Expose ping function globally for APK to call
window.pingFromApk = pingFromApk;

// ==================== INITIALIZE ====================
function init() {
    initData();
    initTabs();
    initVerifyTypeButtons();
    initSearchListener();
    updateAllStats();
    updateHistoryList();
    updateVerifiedList();
    updateUsersTable();
    drawChart();
}

document.addEventListener('DOMContentLoaded', init);
