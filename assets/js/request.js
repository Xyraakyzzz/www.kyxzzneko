
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, serverTimestamp, onValue, query, limitToLast } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js?v=1779461076005";

const firebaseConfig = {
  apiKey: "AIzaSyD6gIg-u6a0ynHnRpz5ovtQiacj5NBrQZ4",
  authDomain: "x-mcjs-api.firebaseapp.com",
  databaseURL: "https://x-mcjs-api-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "x-mcjs-api",
  storageBucket: "x-mcjs-api.firebasestorage.app",
  messagingSenderId: "978202552843",
  appId: "1:978202552843:web:9c5adfc553c807a2fdb50e",
  measurementId: "G-GX1EZB0GQW"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
let existingRequestsCache = [];
let requestRules = [];

fetch('/User/Chat/keyword.json')
    .then(r => r.json())
    .then(data => {
        requestRules = data.requestRules || [];
    })
    .catch(e => console.error("Error loading request validation rules:", e));

const styleRequest = document.createElement('style');
styleRequest.innerHTML = `
    #requestModal { z-index: 10000; background: rgba(0, 0, 0, 0.96); backdrop-filter: blur(12px); }
    #requestModal > div {
        background: #0a0a0a; border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px; box-shadow: 0 0 0 1px rgba(255,255,255,0.02), 0 30px 60px rgba(0,0,0,0.9);
        font-family: 'Plus Jakarta Sans', monospace; max-width: 420px; width: 90%;
        display: flex; flex-direction: column; overflow: hidden;
    }

    .req-tabs { display: flex; gap: 8px; padding: 12px 16px 0 16px; }
    .req-tab-btn {
        flex: 1; padding: 10px; border-radius: 8px; font-size: 11px; font-weight: 800;
        text-transform: uppercase; letter-spacing: 0.5px; cursor: pointer; text-align: center;
        transition: all 0.2s ease; border: 1px solid transparent;
        color: #666; background: rgba(255,255,255,0.03);
    }
    .req-tab-btn:hover { background: rgba(255,255,255,0.06); color: #999; }
    .req-tab-btn.active {
        background: #3b82f6; color: #000; border-color: #3b82f6;
        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
    }

    .req-view-container { height: 420px; position: relative; overflow-y: auto; overflow-x: hidden; }
    .req-view { display: none; padding: 20px; animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .req-view.active { display: block; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .req-input {
        width: 100%; background: #111; border: 1px solid #222; color: #ededed;
        padding: 12px; border-radius: 8px; font-family: monospace; font-size: 13px;
        margin-top: 8px; outline: none; transition: border 0.2s;
    }
    .req-input:focus { border-color: #3b82f6; background: #151515; }
    .req-label { color: #888; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-top: 16px; display: block; }

    .btn-req-send {
        background: #3b82f6; color: #000; font-weight: 800; text-transform: uppercase;
        font-family: monospace; letter-spacing: 1px; padding: 14px; border-radius: 8px;
        width: 100%; margin-top: 24px; transition: transform 0.1s; border: none; cursor: pointer;
    }
    .btn-req-send:active { transform: scale(0.98); }

    .req-toolbar {
        display: flex; gap: 8px; margin-bottom: 15px; position: sticky; top: -20px; 
        background: #0a0a0a; z-index: 10; padding-top: 5px; padding-bottom: 10px;
        border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .req-input-small {
        flex: 2; background: #111; border: 1px solid #222; color: white;
        padding: 8px 12px; border-radius: 6px; font-size: 12px; font-family: monospace; outline: none;
    }
    .req-select-small {
        flex: 1; background: #111; border: 1px solid #222; color: white;
        padding: 8px; border-radius: 6px; font-size: 11px; font-family: monospace; outline: none; cursor: pointer;
    }
    .req-input-small:focus, .req-select-small:focus { border-color: #3b82f6; }

    .req-item {
        background: #111; border: 1px solid #222; border-radius: 8px;
        padding: 12px; margin-bottom: 10px; position: relative;
    }
    .req-item-title { font-weight: bold; font-size: 14px; color: #fff; margin-bottom: 4px; }
    .req-item-meta { font-size: 10px; color: #666; display: flex; justify-content: space-between; margin-top: 8px; }
    
    .req-status { font-size: 9px; padding: 3px 6px; border-radius: 4px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; }
    .status-pending { background: rgba(255, 165, 0, 0.15); color: #fbbf24; border: 1px solid rgba(255, 165, 0, 0.2); }
    .status-done { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.2); }
    .status-progress { background: rgba(168, 85, 247, 0.15); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.2); }
    .status-rejected { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }

    .req-reason-box {
        margin-top: 8px; padding: 10px; background: rgba(239, 68, 68, 0.05);
        border-left: 3px solid #ef4444; border-radius: 4px;
    }
    .req-reason-title { font-size: 9px; font-weight: bold; color: #ef4444; text-transform: uppercase; margin-bottom: 4px; }
    .req-reason-text { font-size: 11px; color: #fca5a5; font-style: italic; }

    .req-view-container::-webkit-scrollbar { width: 4px; }
    .req-view-container::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }

    .kyxzz-toast {
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-20px);
        background: #ef4444; color: white; padding: 12px 20px; border-radius: 6px;
        font-size: 13px; font-weight: 600; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        opacity: 0; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); z-index: 20000;
        display: flex; align-items: center; gap: 8px; pointer-events: none;
    }
    .kyxzz-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
    #validatorModal { z-index: 20100; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px); }
    #validatorModal > div {
        background: #0f0f12; border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);
        max-width: 380px; width: 90%;
        display: flex; flex-direction: column; overflow: hidden;
    }
`;
document.head.appendChild(styleRequest);

const modalHTML = `
<div id="requestModal" class="hidden fixed inset-0 flex items-center justify-center p-4">
    <div class="animate-in">
        <div class="flex justify-between items-center p-4 border-b border-white/10 shrink-0">
            <span class="font-bold text-white text-sm tracking-wider uppercase">Request Center</span>
            <button id="closeReqModal" class="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-500 border border-red-500/20 rounded hover:bg-red-500/20 transition">&times;</button>
        </div>

        <div class="req-tabs">
            <div id="tabForm" class="req-tab-btn active" onclick="switchReqTab('form')">Request Baru</div>
            <div id="tabList" class="req-tab-btn" onclick="switchReqTab('list')">Daftar Request</div>
        </div>
        
        <div class="req-view-container">
            <div id="viewForm" class="req-view active">
                <div class="bg-blue-500/5 border border-blue-500/10 p-3 rounded-lg mb-4">
                    <p class="text-[10px] text-blue-300 leading-relaxed">
                        Pastikan API yang direquest belum pernah di request. Gunakan fitur pencarian di tab sebelah sebelum request.
                    </p>
                </div>
                <label class="req-label">Nama Api</label>
                <input type="text" id="reqName" class="req-input" placeholder="e.g. Scarpe Target">
                <label class="req-label">Link Webs</label>
                <input type="text" id="reqLink" class="req-input" placeholder="https://example.com/...">
                <label class="req-label">Description</label>
                <textarea id="reqFeature" class="req-input" rows="3" placeholder="e.g. Get All data return json, scarpe data"></textarea>
                <button id="submitReq" class="btn-req-send">Kirim Request</button>
            </div>

            <div id="viewList" class="req-view">
                <div class="req-toolbar">
                    <input type="text" id="reqSearch" placeholder="Cari nama aplikasi..." class="req-input-small" oninput="window.filterRequests()">
                    <select id="reqFilter" class="req-select-small" onchange="window.filterRequests()">
                        <option value="all">Semua Status</option>
                        <option value="pending">Pending</option>
                        <option value="on_progress">On Progress</option>
                        <option value="success">Success</option>
                        <option value="rejected">Ditolak</option>
                    </select>
                </div>
                <div id="reqListPanel">
                    <div class="text-center text-slate-600 text-xs py-10">Memuat data...</div>
                </div>
            </div>
        </div>
    </div>
</div>
<div id="KyxzzToast" class="kyxzz-toast">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
    <span id="toastMsg">Error Message</span>
</div>
<div id="validatorModal" class="hidden fixed inset-0 flex items-center justify-center p-4">
    <div class="animate-in bg-[#0f0f12] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 text-slate-100 font-sans" style="font-family: 'Plus Jakarta Sans', sans-serif;">
        <div class="flex items-center gap-3 border-b border-white/5 pb-3">
            <div class="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div>
                <h3 class="text-white font-bold text-sm tracking-wide uppercase">Info Aplikasi</h3>
                <p class="text-[9px] text-slate-500 font-bold uppercase tracking-wider">System Validation</p>
            </div>
        </div>
        
        <p id="validatorMsg" class="text-sm text-slate-300 leading-relaxed font-mono"></p>
        
        <div class="flex gap-3 mt-2">
            <button id="validatorClose" class="flex-grow py-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition active:scale-95">Tutup</button>
            <a id="validatorRedirect" href="#" class="hidden flex-grow py-3 bg-blue-600 text-black hover:bg-blue-500 rounded-xl text-xs font-black uppercase tracking-wider text-center transition active:scale-95 flex items-center justify-center">Buka</a>
        </div>
    </div>
</div>
`;
document.body.insertAdjacentHTML('beforeend', modalHTML);
document.getElementById('closeReqModal').onclick = () => window.toggleRequestModal(false);

window.toggleRequestModal = (show) => {
    const modal = document.getElementById('requestModal');
    if (show) {
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
};

function showValidatorModal(rule, apiName = "") {
    const modal = document.getElementById('validatorModal');
    const msgEl = document.getElementById('validatorMsg');
    const closeBtn = document.getElementById('validatorClose');
    const redirectBtn = document.getElementById('validatorRedirect');

    if (!modal || !msgEl) return;

    let message = rule.popupText;
    if (apiName) {
        message = message.replace("{apiName}", apiName);
    }

    msgEl.innerText = message;

    if (rule.redirectUrl) {
        redirectBtn.href = rule.redirectUrl;
        redirectBtn.classList.remove('hidden');
        redirectBtn.style.display = 'flex';
    } else {
        redirectBtn.classList.add('hidden');
        redirectBtn.style.display = 'none';
    }

    let autoRedirectTimer = null;
    if (rule.autoRedirect && rule.redirectUrl) {
        let secondsLeft = 2;
        msgEl.innerHTML = `${message}<br><span class="text-xs text-blue-400 mt-2 block animate-pulse">Mengalihkan otomatis dalam ${secondsLeft} detik...</span>`;

        autoRedirectTimer = setInterval(() => {
            secondsLeft--;
            if (secondsLeft <= 0) {
                clearInterval(autoRedirectTimer);
                window.location.href = rule.redirectUrl;
            } else {
                msgEl.innerHTML = `${message}<br><span class="text-xs text-blue-400 mt-2 block animate-pulse">Mengalihkan otomatis dalam ${secondsLeft} detik...</span>`;
            }
        }, 1000);
    }

    modal.classList.remove('hidden');

    const closeModal = () => {
        if (autoRedirectTimer) clearInterval(autoRedirectTimer);
        modal.classList.add('hidden');
    };

    closeBtn.onclick = closeModal;
    redirectBtn.onclick = closeModal;
}

window.switchReqTab = (tabName) => {
    const tabForm = document.getElementById('tabForm');
    const tabList = document.getElementById('tabList');
    const viewForm = document.getElementById('viewForm');
    const viewList = document.getElementById('viewList');
    if (tabName === 'form') {
        tabForm.classList.add('active'); tabList.classList.remove('active');
        viewForm.classList.add('active'); viewList.classList.remove('active');
    } else {
        tabList.classList.add('active'); tabForm.classList.remove('active');
        viewList.classList.add('active'); viewForm.classList.remove('active');
    }
};

window._showToast = (message, type = 'error') => {
    const toast = document.getElementById('KyxzzToast');
    const toastMsg = document.getElementById('toastMsg');
    const toastIcon = toast.querySelector('svg');

    toastMsg.innerText = message;
    toast.className = 'kyxzz-toast';

    if (type === 'success') {
        toast.style.background = '#22c55e'; 
        toastIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />';
    } else {
        toast.style.background = '#ef4444'; 
        toastIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />';
    }

    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
};

function isDuplicate(newName) {
    if (!newName) return false;
    const cleanNew = newName.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    if (!cleanNew) return false;

    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    return existingRequestsCache.some(req => {
        if (!req.ApiName) return false;
        const cleanOld = req.apiName.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
        const isNameMatch = cleanOld === cleanNew || cleanOld.includes(cleanNew) || cleanNew.includes(cleanOld);

        if (isNameMatch) {
            const reqTime = req.timestamp || 0;
            return (now - reqTime) < ONE_WEEK_MS;
        }
        return false;
    });
}

window.filterRequests = () => {
    const searchTerm = document.getElementById('reqSearch').value.toLowerCase();
    const filterStatus = document.getElementById('reqFilter').value;
    const filteredData = existingRequestsCache.filter(req => {
        const matchesName = req.apiName.toLowerCase().includes(searchTerm);
        let matchesStatus = true;
        if (filterStatus !== 'all') {
            const status = req.status || 'pending';
            if (filterStatus === 'pending') matchesStatus = status === 'pending';
            if (filterStatus === 'on_progress') matchesStatus = status === 'on_progress';
            if (filterStatus === 'success') matchesStatus = status === 'success' || status === 'done';
            if (filterStatus === 'rejected') matchesStatus = status === 'rejected';
        }
        return matchesName && matchesStatus;
    });
    renderRequestList(filteredData);
};

function renderRequestList(data) {
    const listPanel = document.getElementById('reqListPanel');
    if (data.length === 0) {
        listPanel.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full py-10 opacity-50">
                <svg class="w-10 h-10 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <div class="text-xs text-gray-500 font-mono">Data tidak ditemukan.</div>
            </div>`;
        return;
    }

    listPanel.innerHTML = data.map(req => {
        const status = req.status || 'pending';
        const isDone = status === 'success' || status === 'done';
        const isProgress = status === 'on_progress';
        const isRejected = status === 'rejected';

        let statusClass = 'status-pending';
        let statusText = 'PENDING';

        if (isDone) { statusClass = 'status-done'; statusText = 'SUCCESS'; }
        else if (isProgress) { statusClass = 'status-progress'; statusText = 'ON PROGRESS'; }
        else if (isRejected) { statusClass = 'status-rejected'; statusText = 'REJECTED'; }

        const date = req.timestamp ? new Date(req.timestamp).toLocaleDateString() : 'Just now';

        let HitsBtn = '';
        if (isDone && req.path_hasil) {
            HitsBtn = `
                <a href="${req.path_hasil}" target="_blank" class="flex items-center justify-center gap-2 mt-3 bg-green-500 text-black py-2.5 rounded-lg text-[10px] font-bold uppercase hover:bg-green-400 transition shadow-lg shadow-green-900/20">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    Test Api
                </a>
            `;
        }

        let reasonBox = '';
        if (isRejected && req.rejectionReason) {
            reasonBox = `
                <div class="req-reason-box">
                    <div class="req-reason-title">Alasan Penolakan:</div>
                    <div class="req-reason-text">"${req.rejectionReason}"</div>
                </div>
            `;
        }

        return `
        <div class="req-item animate-in">
            <div class="flex justify-between items-start mb-2">
                <div class="req-item-title flex-1 mr-2">${req.apiName}</div>
                <span class="req-status ${statusClass}">${statusText}</span>
            </div>
            
            <div class="bg-black/30 p-2 rounded border border-white/5 text-[11px] text-slate-300 font-mono leading-relaxed">
                ${req.description}
            </div>
            
            ${reasonBox}
            ${HitsBtn}

            <div class="req-item-meta">
                <span class="flex items-center gap-1">
                    <svg class="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    <span class="text-blue-400 font-bold">${req.username}</span>
                </span>
                <span class="opacity-50">${date}</span>
            </div>
        </div>
        `;
    }).join('');
}

document.getElementById('closeReqModal').onclick = () => document.getElementById('requestModal').classList.add('hidden');

document.getElementById('submitReq').onclick = () => {
    const user = auth.currentUser;
    if (!user) { window.showToast("Harap login dahulu!"); return; }

    const apiName = document.getElementById('reqName').value.trim();
    const ApiLink = document.getElementById('reqLink').value.trim();
    const ApiFeat = document.getElementById('reqFeature').value.trim();

    if (!apiName || !ApiFeat) { window.showToast("Nama & Fitur wajib diisi!"); return; }

    const lowerName = apiName.toLowerCase();
    const matchedRule = requestRules.find(rule =>
        rule.keywords.some(kw => lowerName.includes(kw.toLowerCase()))
    );

    if (matchedRule) {
        showValidatorModal(matchedRule, ApiName);
        return;
    }

    if (isDuplicate(ApiName)) {
        window.showToast("Api Sudah Pernah Di request, Tunggu Admin Upload");
        window.switchReqTab('list');
        document.getElementById('reqSearch').value = ApiName;
        window.filterRequests();
        return;
    }

    const forbiddenPattern = /<script\b[^>]*>([\s\S]*?)<\/script>|javascript:|on\w+=/i;
    if (forbiddenPattern.test(apiName) || forbiddenPattern.test(ApiLink) || forbiddenPattern.test(ApiFeat)) {
        alert("Input mengandung karakter terlarang atau script berbahaya! Request dibatalkan.");
        return;
    }

    const lastReqTime = localStorage.getItem('lastReqTime');
    if (lastReqTime) {
        const timeDiff = Date.now() - parseInt(lastReqTime);
        const cooldown = 5 * 60 * 1000; 
        if (timeDiff < cooldown) {
            const remaining = Math.ceil((cooldown - timeDiff) / 1000 / 60);
            window.showToast(`Tunggu ${remaining} menit lagi sebelum request baru.`);
            return;
        }
    }

    const btn = document.getElementById('submitReq');
    btn.innerText = "Mengirim..."; btn.disabled = true;

    push(ref(db, 'request'), {
        uid: user.uid,
        username: user.displayName || "User",
        apiName: apiName,
        scarpeLink: ApiLink || "-",
        description: ApiFeat,
        timestamp: serverTimestamp(),
        status: "pending"
    }).then(() => {
        window.showToast("Request berhasil dikirim!", "success");
        localStorage.setItem('lastReqTime', Date.now().toString()); // Set timestamp
        document.getElementById('reqName').value = '';
        document.getElementById('reqLink').value = '';
        document.getElementById('reqFeature').value = '';
        window.switchReqTab('list');
        document.getElementById('reqSearch').value = "";
        document.getElementById('reqFilter').value = "all";
        window.filterRequests();
    }).catch(err => window.showToast(err.message))
        .finally(() => { btn.innerText = "Kirim Request"; btn.disabled = false; });
};

onValue(query(ref(db, 'request'), limitToLast(200)), (snapshot) => {
    existingRequestsCache = [];
    if (snapshot.exists()) {
        const data = [];
        snapshot.forEach(child => { data.push(child.val()); });
        data.reverse();
        existingRequestsCache = data;
    }
    window.filterRequests();
});
