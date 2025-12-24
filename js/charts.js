// charts.js - Quản lý biểu đồ thống kê
// =====================================

import { getFilteredTransactions } from './storage.js';
import { formatMoney } from './ui.js';

let charts = {}; // Nơi lưu trữ các biểu đồ đang hiện

export function updateAllCharts() {
    // --- LỚP BẢO VỆ: Kiểm tra xem hộp lọc có tồn tại không ---
    const filterEl = document.getElementById('chartFilter');
    if (!filterEl) return; // Nếu không thấy cái hộp này thì thoát ra luôn, không làm tiếp

    const filterValue = filterEl.value;
    const filteredData = getFilteredTransactions(filterValue);

    updateIncomeExpenseChart(filteredData);
    updateCategoryPieChart(filteredData);
    updateTrendChart(filteredData);
    updateTopCategoriesChart(filteredData);
}

// 1. Biểu đồ Cột: Thu Nhập vs Chi Tiêu
function updateIncomeExpenseChart(data) {
    const income = data.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = data.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    
    renderChart('incomeExpenseChart', 'bar', ['Thu Nhập', 'Chi Tiêu'], [income, expense], ['#10b981', '#ef4444']);
}

// 2. Biểu đồ Tròn: Phân bổ chi tiêu
function updateCategoryPieChart(data) {
    const expenses = data.filter(t => t.type === 'expense');
    const categories = {};
    expenses.forEach(t => categories[t.category] = (categories[t.category] || 0) + t.amount);
    
    renderChart('categoryPieChart', 'doughnut', Object.keys(categories), Object.values(categories));
}

// 3. Biểu đồ Đường: Xu hướng theo thời gian
function updateTrendChart(data) {
    const dailyData = {};
    
    data.forEach(t => {
        const dateKey = new Date(t.date).toISOString().split('T')[0];
        if (!dailyData[dateKey]) dailyData[dateKey] = { income: 0, expense: 0 };
        dailyData[dateKey][t.type] += t.amount;
    });

    const sortedDates = Object.keys(dailyData).sort();
    const labels = sortedDates.map(d => new Date(d).toLocaleDateString('vi-VN'));
    const incomeData = sortedDates.map(d => dailyData[d].income);
    const expenseData = sortedDates.map(d => dailyData[d].expense);

    renderTrendChart(labels, incomeData, expenseData);
}

// 4. Biểu đồ Cột ngang: Top 5 hạng mục
function updateTopCategoriesChart(data) {
    const expenses = data.filter(t => t.type === 'expense');
    const categories = {};
    expenses.forEach(t => categories[t.category] = (categories[t.category] || 0) + t.amount);

    const top5 = Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    renderChart('topCategoriesChart', 'bar', top5.map(i => i[0]), top5.map(i => i[1]), '#6366f1', true);
}

// Hàm vẽ biểu đồ chung
function renderChart(id, type, labels, data, colors, isHorizontal = false) {
    const ctx = document.getElementById(id);
    if (!ctx) return;
    if (charts[id]) charts[id].destroy(); 

    charts[id] = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors || ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'],
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: isHorizontal ? 'y' : 'x',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: type === 'doughnut' } }
        }
    });
}

// Hàm riêng cho biểu đồ đường
function renderTrendChart(labels, income, expense) {
    const id = 'trendChart';
    const ctx = document.getElementById(id);
    if (!ctx) return;
    if (charts[id]) charts[id].destroy();

    charts[id] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: 'Thu Nhập', data: income, borderColor: '#10b981', tension: 0.3 },
                { label: 'Chi Tiêu', data: expense, borderColor: '#ef4444', tension: 0.3 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}