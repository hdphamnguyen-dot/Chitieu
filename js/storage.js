// storage.js - Quản lý lưu trữ dữ liệu
// ============================================

export const appState = {
    transactions: [],
    settings: {
        openrouter: { key: '', model: '', connected: false },
        gemini: { key: '', model: '', connected: false },
        activeProvider: ''
    },
    uploadedImages: []
};

export function loadData() {
    try {
        const saved = localStorage.getItem('expenseData');
        if (saved) appState.transactions = JSON.parse(saved);
        
        const savedSettings = localStorage.getItem('expenseSettings');
        if (savedSettings) appState.settings = JSON.parse(savedSettings);
    } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
    }
}

export function saveData() {
    localStorage.setItem('expenseData', JSON.stringify(appState.transactions));
    localStorage.setItem('expenseSettings', JSON.stringify(appState.settings));
}

export function addTransaction(transaction) {
    appState.transactions.push({
        ...transaction,
        date: new Date().toISOString()
    });
    saveData();
}

export function deleteTransaction(index) {
    appState.transactions.splice(index, 1);
    saveData();
}

// --- HÀM NÀY ĐÃ ĐƯỢC SỬA ĐỂ KHÔNG BỊ LỖI KHI CHỌN "ALL" ---
export function getFilteredTransactions(days = null) {
    // Nếu chọn "all" hoặc không truyền gì vào, trả về tất cả
    if (!days || days === 'all') return appState.transactions;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    return appState.transactions.filter(t => 
        new Date(t.date) >= cutoffDate
    );
}

export function calculateTotals() {
    const data = appState.transactions;
    const income = data.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
}