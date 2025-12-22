import { appState, calculateTotals } from './storage.js';

export function formatMoney(v) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v); }

export function switchTab(tab) {
    document.querySelectorAll('.tab, .tab-content').forEach(el => el.classList.remove('active'));
    document.querySelector(`.tab:nth-child(${['main','charts','settings'].indexOf(tab)+1})`).classList.add('active');
    document.getElementById(tab + '-tab').classList.add('active');
    if (tab === 'charts') setTimeout(() => document.dispatchEvent(new Event('updateCharts')), 100);
}

export function showMessage(msg, type) {
    const m = document.getElementById('message'); m.textContent = msg; m.className = type; m.style.display = 'block';
    if (type !== 'loading') setTimeout(() => m.style.display = 'none', 3000);
}

export function updateStatusIndicators() {
    const s = appState.settings;
    document.getElementById('geminiStatus').className = 'api-status ' + (s.gemini.connected ? 'connected' : 'disconnected');
    document.getElementById('openrouterStatus').className = 'api-status ' + (s.openrouter.connected ? 'connected' : 'disconnected');
}

export function updateSummaryCards() {
    const t = calculateTotals();
    document.getElementById('totalIncome').textContent = formatMoney(t.income);
    document.getElementById('totalExpense').textContent = formatMoney(t.expense);
    document.getElementById('balance').textContent = formatMoney(t.balance);
}

export function updateTransactionList() {
    const l = document.getElementById('transactionList');
    l.innerHTML = appState.transactions.slice().reverse().map((t, i) => `
        <div class="transaction-item">
            <span><b>${t.category}</b>: ${t.description}</span>
            <span class="${t.type}">${t.type === 'income'?'+':'-'}${formatMoney(t.amount)}</span>
            <button onclick="window.deleteTransactionHandler(${appState.transactions.length-1-i})">Xóa</button>
        </div>`).join('');
}

export function clearInputs() { document.getElementById('naturalInput').value = ''; appState.uploadedImages = []; }