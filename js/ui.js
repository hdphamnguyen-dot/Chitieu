// ui.js - Quản lý giao diện, tabs và messages
// =============================================

import { appState, calculateTotals } from './storage.js';

// Định dạng tiền tệ
export function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(amount);
}

// Chuyển đổi tab
export function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => 
        t.classList.remove('active')
    );
    document.querySelectorAll('.tab-content').forEach(c => 
        c.classList.remove('active')
    );
    
    let tabIndex = 0;
    let tabId = 'main-tab';
    
    if (tab === 'main') {
        tabIndex = 0;
        tabId = 'main-tab';
    } else if (tab === 'charts') {
        tabIndex = 1;
        tabId = 'charts-tab';
    } else if (tab === 'settings') {
        tabIndex = 2;
        tabId = 'settings-tab';
    }
    
    document.querySelectorAll('.tab')[tabIndex].classList.add('active');
    document.getElementById(tabId).classList.add('active');
    
    // Cập nhật biểu đồ khi chuyển sang tab charts
    if (tab === 'charts') {
        setTimeout(() => {
            const updateChartsEvent = new Event('updateCharts');
            document.dispatchEvent(updateChartsEvent);
        }, 100);
    }
}

// Hiển thị message
export function showMessage(msg, type) {
    const msgDiv = document.getElementById('message');
    msgDiv.className = type;
    msgDiv.textContent = msg;
    msgDiv.style.display = 'block';
    
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            msgDiv.style.display = 'none';
        }, 3000);
    }
}

// Cập nhật status API
export function updateStatusIndicators() {
    const orStatus = document.getElementById('openrouterStatus');
    const geminiStatus = document.getElementById('geminiStatus');
    
    if (appState.settings.openrouter.connected) {
        orStatus.textContent = 'Đã kết nối';
        orStatus.className = 'api-status connected';
    } else {
        orStatus.textContent = 'Chưa kết nối';
        orStatus.className = 'api-status disconnected';
    }
    
    if (appState.settings.gemini.connected) {
        geminiStatus.textContent = 'Đã kết nối';
        geminiStatus.className = 'api-status connected';
    } else {
        geminiStatus.textContent = 'Chưa kết nối';
        geminiStatus.className = 'api-status disconnected';
    }
}

// Cập nhật thẻ thống kê
export function updateSummaryCards() {
    const totals = calculateTotals();
    
    document.getElementById('totalIncome').textContent = 
        formatMoney(totals.income);
    document.getElementById('totalExpense').textContent = 
        formatMoney(totals.expense);
    document.getElementById('balance').textContent = 
        formatMoney(totals.balance);
}

// Hiển thị danh sách giao dịch
export function updateTransactionList() {
    const listDiv = document.getElementById('transactionList');
    
    if (appState.transactions.length === 0) {
        listDiv.innerHTML = '<p style="text-align: center; color: #999;">Chưa có giao dịch nào</p>';
        return;
    }
    
    listDiv.innerHTML = appState.transactions
        .slice()
        .reverse()
        .map((t, i) => {
            const actualIndex = appState.transactions.length - 1 - i;
            const date = new Date(t.date).toLocaleString('vi-VN');
            const sign = t.type === 'income' ? '+' : '-';
            const className = t.type === 'income' ? 'income' : 'expense';
            
            return `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <span class="transaction-category">${t.category}</span>
                        <span>${t.description}</span>
                        <div class="transaction-date">${date}</div>
                    </div>
                    <div>
                        <span class="transaction-amount ${className}">
                            ${sign}${formatMoney(t.amount)}
                        </span>
                        <button class="delete-btn" onclick="window.deleteTransactionHandler(${actualIndex})">
                            Xóa
                        </button>
                    </div>
                </div>
            `;
        }).join('');
}

// Xóa input và preview ảnh
export function clearInputs() {
    document.getElementById('naturalInput').value = '';
    appState.uploadedImages = [];
}

// Vô hiệu hoá/kích hoạt nút
export function setButtonState(buttonId, disabled, text) {
    const btn = document.getElementById(buttonId);
    btn.disabled = disabled;
    if (text) btn.textContent = text;
}

// Đọc giá trị input
export function getInputValue(elementId) {
    return document.getElementById(elementId).value.trim();
}

// Thiết lập giá trị input
export function setInputValue(elementId, value) {
    document.getElementById(elementId).value = value;
}

// Cập nhật danh sách model
export function updateModelSelect(selectId, models, displayFn) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Chọn model...</option>';
    
    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.id || model.name;
        option.textContent = displayFn(model);
        select.appendChild(option);
    });
    
    select.disabled = false;
}

// Bật/tắt select
export function setSelectDisabled(selectId, disabled) {
    document.getElementById(selectId).disabled = disabled;
}