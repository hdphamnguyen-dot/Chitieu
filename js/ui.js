import { appState, calculateTotals } from './storage.js';

export function formatMoney(v) { 
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v); 
}

export function switchTab(tab) {
    // Xóa active cũ
    document.querySelectorAll('.tab, .tab-content').forEach(el => el.classList.remove('active'));
    
    // Kích hoạt tab mới
    const targetContent = document.getElementById(tab + '-tab');
    if (targetContent) targetContent.classList.add('active');
    
    // Làm sáng nút tab
    const tabList = ['main', 'charts', 'settings'];
    const tabButtons = document.querySelectorAll('.tab');
    const index = tabList.indexOf(tab);
    if (index !== -1 && tabButtons[index]) {
        tabButtons[index].classList.add('active');
    }
    
    // Nếu là biểu đồ, đợi giao diện hiện ra xong mới vẽ
    if (tab === 'charts') {
        setTimeout(() => {
            document.dispatchEvent(new Event('updateCharts'));
        }, 150); // Tăng thời gian chờ lên một chút cho chắc chắn
    }
}

export function showMessage(msg, type) {
    const m = document.getElementById('message'); 
    if (!m) return;
    m.textContent = msg; 
    m.className = type; 
    m.style.display = 'block';
    if (type !== 'loading') setTimeout(() => m.style.display = 'none', 3000);
}

export function updateStatusIndicators() {
    const s = appState.settings;
    const g = document.getElementById('geminiStatus');
    const o = document.getElementById('openrouterStatus');
    if (g) g.className = 'api-status ' + (s.gemini.connected ? 'connected' : 'disconnected');
    if (o) o.className = 'api-status ' + (s.openrouter.connected ? 'connected' : 'disconnected');
}

export function updateSummaryCards() {
    const t = calculateTotals();
    const inc = document.getElementById('totalIncome');
    const exp = document.getElementById('totalExpense');
    const bal = document.getElementById('balance');
    if (inc) inc.textContent = formatMoney(t.income);
    if (exp) exp.textContent = formatMoney(t.expense);
    if (bal) bal.textContent = formatMoney(t.balance);
}

export function updateTransactionList() {
    const l = document.getElementById('transactionList');
    if (!l) return;
    
    const header = `
        <div class="transaction-header">
            <span>Hạng mục</span>
            <span>Mô tả</span>
            <span style="text-align: right;">Số tiền</span>
            <span>Xóa</span>
        </div>
    `;

    l.innerHTML = header + appState.transactions.slice().reverse().map((t, i) => `
        <div class="transaction-item">
            <span class="col-cat">${t.category}</span>
            <span class="col-desc">${t.description}</span>
            <span class="col-amount ${t.type}">${t.type === 'income'?'+':'-'}${formatMoney(t.amount)}</span>
            <div class="col-action">
                <button class="delete-btn" onclick="window.deleteTransactionHandler(${appState.transactions.length-1-i})">×</button>
            </div>
        </div>`).join('');
}

export function clearInputs() { 
    const input = document.getElementById('naturalInput');
    if (input) input.value = ''; 
}