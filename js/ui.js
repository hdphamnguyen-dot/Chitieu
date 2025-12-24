import { appState, calculateTotals } from './storage.js';

// Định dạng tiền tệ VND
export function formatMoney(v) { 
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v); 
}

// Chuyển đổi giữa các Tab
export function switchTab(tab) {
    document.querySelectorAll('.tab, .tab-content').forEach(el => el.classList.remove('active'));
    document.querySelector(`.tab:nth-child(${['main','charts','settings'].indexOf(tab)+1})`).classList.add('active');
    document.getElementById(tab + '-tab').classList.add('active');
    
    // Nếu sang tab biểu đồ thì kích hoạt vẽ lại
    if (tab === 'charts') {
        setTimeout(() => document.dispatchEvent(new Event('updateCharts')), 100);
    }
}

// Hiển thị thông báo cho người dùng
export function showMessage(msg, type) {
    const m = document.getElementById('message'); 
    m.textContent = msg; 
    m.className = type; 
    m.style.display = 'block';
    if (type !== 'loading') {
        setTimeout(() => m.style.display = 'none', 3000);
    }
}

// Cập nhật đèn báo trạng thái API
export function updateStatusIndicators() {
    const s = appState.settings;
    document.getElementById('geminiStatus').className = 'api-status ' + (s.gemini.connected ? 'connected' : 'disconnected');
    document.getElementById('openrouterStatus').className = 'api-status ' + (s.openrouter.connected ? 'connected' : 'disconnected');
}

// Cập nhật 3 thẻ tóm tắt trên cùng
export function updateSummaryCards() {
    const t = calculateTotals(); // Lấy dữ liệu từ storage
    document.getElementById('totalIncome').textContent = formatMoney(t.income);
    document.getElementById('totalExpense').textContent = formatMoney(t.expense);
    document.getElementById('balance').textContent = formatMoney(t.balance);
}

// --- HÀM CẬP NHẬT DANH SÁCH GIAO DỊCH THẲNG HÀNG ---
export function updateTransactionList() {
    const l = document.getElementById('transactionList');
    
    if (appState.transactions.length === 0) {
        l.innerHTML = '<p style="text-align:center; padding: 20px; color: #94a3b8;">Chưa có giao dịch nào được ghi lại.</p>';
        return;
    }

    // Tạo dòng tiêu đề
    const header = `
        <div class="transaction-header">
            <span>Hạng mục</span>
            <span>Mô tả</span>
            <span style="text-align: right;">Số tiền</span>
            <span style="text-align: center;">Thao tác</span>
        </div>
    `;

    // Tạo nội dung từng hàng (đảo ngược để cái mới nhất lên đầu)
    const items = appState.transactions.slice().reverse().map((t, i) => {
        const realIndex = appState.transactions.length - 1 - i;
        const typeClass = t.type === 'income' ? 'income' : 'expense';
        const sign = t.type === 'income' ? '+' : '-';

        return `
        <div class="transaction-item">
            <span class="col-cat" title="${t.category}">${t.category}</span>
            <span class="col-desc">${t.description}</span>
            <span class="col-amount ${typeClass}">${sign}${formatMoney(t.amount)}</span>
            <div class="col-action">
                <button class="delete-btn" onclick="window.deleteTransactionHandler(${realIndex})">Xóa</button>
            </div>
        </div>`;
    }).join('');

    l.innerHTML = header + items;
}

// Xóa trắng ô nhập liệu
export function clearInputs() { 
    document.getElementById('naturalInput').value = ''; 
    // Lưu ý: appState.uploadedImages được xóa qua hàm clearUploadedImages ở image-handler.js
}