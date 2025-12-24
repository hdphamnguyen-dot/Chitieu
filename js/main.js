import { loadData, deleteTransaction } from './storage.js';
import { switchTab, updateTransactionList, updateSummaryCards } from './ui.js';
import { initImageUpload, removeImage } from './image-handler.js';
import { loadAPISettingsToForm, saveAPISettings, testOpenRouter, testGemini } from './api-config.js';
import { processTransaction } from './ai-processor.js';
import { updateAllCharts } from './charts.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Tải dữ liệu và cài đặt ban đầu
    loadData(); 
    initImageUpload(); 
    loadAPISettingsToForm();
    
    // 2. Cập nhật giao diện lần đầu
    updateSummaryCards(); 
    updateTransactionList();
    
    // 3. Gắn sự kiện cho các Tab (Cách viết an toàn)
    const tabs = ['main', 'charts', 'settings'];
    document.querySelectorAll('.tab').forEach((button, index) => {
        button.onclick = () => switchTab(tabs[index]);
    });

    // 4. Gắn sự kiện cho các nút bấm chức năng
    const btnIds = {
        'processBtn': processTransaction,
        'geminiTestBtn': testGemini,
        'openrouterTestBtn': testOpenRouter,
        'saveSettingsBtn': saveAPISettings
    };

    for (let id in btnIds) {
        const el = document.getElementById(id);
        if (el) el.onclick = btnIds[id];
    }

    // 5. Gắn sự kiện cho bộ lọc biểu đồ
    const chartFilter = document.getElementById('chartFilter');
    if (chartFilter) chartFilter.onchange = updateAllCharts;

    // 6. Lắng nghe lệnh vẽ lại biểu đồ từ các module khác
    document.addEventListener('updateCharts', updateAllCharts);
});

// Các hàm toàn cục (để HTML có thể gọi được)
window.deleteTransactionHandler = (i) => { 
    deleteTransaction(i); 
    updateTransactionList(); 
    updateSummaryCards(); 
};
window.removeImageHandler = (i) => removeImage(i);