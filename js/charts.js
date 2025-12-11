// charts.js - Quản lý biểu đồ thống kê
// =====================================

import { appState, getFilteredTransactions } from './storage.js';
import { formatMoney } from './ui.js';

let charts = {
    incomeExpense: null,
    categoryPie: null,
    trend: null,
    topCategories: null
};

// Cập nhật tất cả biểu đồ
export function updateAllCharts() {
    const filterValue = document.getElementById('chartFilter').value;
    let filteredData;
    
    if (filterValue === 'all') {
        filteredData = appState.transactions;
    } else {
        const days = parseInt(filterValue);
        filteredData = getFilteredTransactions(days);
    }

    updateIncomeExpenseChart(filteredData);
    updateCategoryPieChart(filteredData);
    updateTrendChart(filteredData);
    updateTopCategoriesChart(filteredData);
}

// Biểu đồ Thu nhập vs Chi tiêu
function updateIncomeExpenseChart(data) {
    const ctx = document.getElementById('incomeExpenseChart');
    if (!ctx) return;

    const totalIncome = data
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = data
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    if (charts.incomeExpense) {
        charts.incomeExpense.destroy();
    }

    charts.incomeExpense = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Thu Nhập', 'Chi Tiêu', 'Số Dư'],
            datasets: [{
                label: 'Số tiền (VNĐ)',
                data: [totalIncome, totalExpense, totalIncome - totalExpense],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(102, 126, 234, 0.8)'
                ],
                borderColor: [
                    'rgb(16, 185, 129)',
                    'rgb(239, 68, 68)',
                    'rgb(102, 126, 234)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => formatMoney(ctx.parsed.y)
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => (value / 1000000).toFixed(1) + 'M'
                    }
                }
            }
        }
    });
}

// Biểu đồ Phân bổ chi tiêu theo hạng mục
function updateCategoryPieChart(data) {
    const ctx = document.getElementById('categoryPieChart');
    if (!ctx) return;

    const expenses = data.filter(t => t.type === 'expense');
    const categoryTotals = {};

    expenses.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const sortedCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);

    if (charts.categoryPie) {
        charts.categoryPie.destroy();
    }

    const colors = [
        'rgba(102, 126, 234, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)'
    ];

    charts.categoryPie = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: sortedCategories.map(c => c[0]),
            datasets: [{
                data: sortedCategories.map(c => c[1]),
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { boxWidth: 15, padding: 10 }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const label = ctx.label || '';
                            const value = formatMoney(ctx.parsed);
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((ctx.parsed / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Biểu đồ Xu hướng chi tiêu theo thời gian
function updateTrendChart(data) {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;

    const dailyData = {};
    
    data.forEach(t => {
        const date = new Date(t.date).toLocaleDateString('vi-VN');
        if (!dailyData[date]) {
            dailyData[date] = { income: 0, expense: 0 };
        }
        if (t.type === 'income') {
            dailyData[date].income += t.amount;
        } else {
            dailyData[date].expense += t.amount;
        }
    });

    const sortedDates = Object.keys(dailyData).sort((a, b) => {
        const dateA = new Date(a.split('/').reverse().join('-'));
        const dateB = new Date(b.split('/').reverse().join('-'));
        return dateA - dateB;
    });

    if (charts.trend) {
        charts.trend.destroy();
    }

    charts.trend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedDates,
            datasets: [
                {
                    label: 'Thu Nhập',
                    data: sortedDates.map(d => dailyData[d].income),
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Chi Tiêu',
                    data: sortedDates.map(d => dailyData[d].expense),
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: (ctx) => 
                            ctx.dataset.label + ': ' + formatMoney(ctx.parsed.y)
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => (value / 1000000).toFixed(1) + 'M'
                    }
                }
            }
        }
    });
}

// Biểu đồ Top 5 hạng mục chi tiêu
function updateTopCategoriesChart(data) {
    const ctx = document.getElementById('topCategoriesChart');
    if (!ctx) return;

    const expenses = data.filter(t => t.type === 'expense');
    const categoryTotals = {};

    expenses.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const topCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (charts.topCategories) {
        charts.topCategories.destroy();
    }

    charts.topCategories = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topCategories.map(c => c[0]),
            datasets: [{
                label: 'Chi tiêu (VNĐ)',
                data: topCategories.map(c => c[1]),
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: 'rgb(102, 126, 234)',
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => formatMoney(ctx.parsed.x)
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => (value / 1000000).toFixed(1) + 'M'
                    }
                }
            }
        }
    });
}

// Hủy tất cả biểu đồ
export function destroyAllCharts() {
    Object.values(charts).forEach(chart => {
        if (chart) chart.destroy();
    });
}