// storage.js - Quản lý lưu trữ dữ liệu
// ============================================

// State toàn cục
export const appState = {
    transactions: [],
    settings: {
        openrouter: { key: '', model: '', connected: false },
        gemini: { key: '', model: '', connected: false },
        activeProvider: ''
    },
    uploadedImages: []
};

// Tải dữ liệu từ localStorage
export function loadData() {
    try {
        const saved = localStorage.getItem('expenseData');
        if (saved) {
            appState.transactions = JSON.parse(saved);
        }
        
        const savedSettings = localStorage.getItem('expenseSettings');
        if (savedSettings) {
            appState.settings = JSON.parse(savedSettings);
        }
    } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
        appState.transactions = [];
    }
}

// Lưu dữ liệu vào localStorage
export function saveData() {
    try {
        localStorage.setItem('expenseData', JSON.stringify(appState.transactions));
        localStorage.setItem('expenseSettings', JSON.stringify(appState.settings));
    } catch (error) {
        console.error('Lỗi lưu dữ liệu:', error);
    }
}

// Thêm giao dịch
export function addTransaction(transaction) {
    appState.transactions.push({
        ...transaction,
        date: new Date().toISOString()
    });
    saveData();
}

// Xóa giao dịch
export function deleteTransaction(index) {
    appState.transactions.splice(index, 1);
    saveData();
}

// Cập nhật settings
export function updateSettings(newSettings) {
    appState.settings = { ...appState.settings, ...newSettings };
    saveData();
}

// Lấy transactions theo filter
export function getFilteredTransactions(days = null) {
    if (!days) return appState.transactions;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return appState.transactions.filter(t => 
        new Date(t.date) >= cutoffDate
    );
}

// Tính tổng thu/chi
export function calculateTotals(transactions = null) {
    const data = transactions || appState.transactions;
    
    const totalIncome = data
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = data
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    return {
        income: totalIncome,
        expense: totalExpense,
        balance: totalIncome - totalExpense
    };
}

// Xóa tất cả dữ liệu (tuỳ chọn)
export function clearAllData() {
    if (confirm('Bạn có chắc muốn xóa tất cả dữ liệu?')) {
        appState.transactions = [];
        appState.uploadedImages = [];
        localStorage.removeItem('expenseData');
        localStorage.removeItem('expenseSettings');
        return true;
    }
    return false;
}