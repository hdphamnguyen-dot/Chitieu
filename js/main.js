// main.js - Khởi tạo ứng dụng
// ============================

// Import modules
import { loadData } from './storage.js';
import { switchTab, updateTransactionList, updateSummaryCards } from './ui.js';
import { initImageUpload, removeImage } from './image-handler.js';
import { 
    loadAPISettingsToForm, 
    saveAPISettings,
    testOpenRouter,
    testGemini 
} from './api-config.js';
import { processTransaction } from './ai-processor.js';
import { updateAllCharts } from './charts.js';
import { appState, deleteTransaction } from './storage.js';

// Flag để tránh init nhiều lần
let isInitialized = false;

// Khởi tạo ứng dụng
function initApp() {
    // Tránh init lặp lại
    if (isInitialized) {
        console.warn('⚠️ App đã được khởi tạo rồi, bỏ qua init thứ 2');
        return;
    }
    isInitialized = true;
    
    console.log('🚀 Khởi tạo ứng dụng Quản lý Chi Tiêu Thông Minh');
    
    // 1. Tải dữ liệu
    loadData();
    console.log('✓ Tải dữ liệu thành công');
    
    // 2. Khởi tạo image upload
    initImageUpload();
    console.log('✓ Khởi tạo upload ảnh');
    
    // 3. Load cài đặt API
    loadAPISettingsToForm();
    console.log('✓ Load cài đặt API');
    
    // 4. Cập nhật UI
    updateSummaryCards();
    updateTransactionList();
    console.log('✓ Cập nhật giao diện');
    
    // 5. Thiết lập event listeners (CHỈ 1 LẦN)
    setupEventListeners();
    console.log('✓ Thiết lập event listeners');
    
    console.log('✅ Ứng dụng sẵn sàng!');
}

// Thiết lập event listeners (gọi 1 lần duy nhất)
function setupEventListeners() {
    // ⚠️ QUAN TRỌNG: Gỡ bỏ onclick cũ, sau đó gắn addEventListener mới
    
    // 1. Tab navigation
    const tabButtons = document.querySelectorAll('.tab');
    tabButtons.forEach((btn, index) => {
        btn.onclick = null;  // Gỡ bỏ onclick cũ
        btn.addEventListener('click', () => {
            const tabs = ['main', 'charts', 'settings'];
            switchTab(tabs[index]);
        });
    });

    // 2. Process transaction button
    const processBtn = document.getElementById('processBtn');
    if (processBtn) {
        processBtn.onclick = null;  // Gỡ bỏ onclick cũ
        processBtn.addEventListener('click', processTransaction);
    }

    // 3. Chart filter change
    const chartFilter = document.getElementById('chartFilter');
    if (chartFilter) {
        chartFilter.addEventListener('change', updateAllCharts);
    }

    // 4. API test buttons - OpenRouter
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        if (btn.textContent.includes('OpenRouter')) {
            btn.onclick = null;
            btn.addEventListener('click', testOpenRouter);
        }
        if (btn.textContent.includes('Gemini')) {
            btn.onclick = null;
            btn.addEventListener('click', testGemini);
        }
        if (btn.textContent.includes('Lưu')) {
            btn.onclick = null;
            btn.addEventListener('click', saveAPISettings);
        }
    });

    // 5. Listen for chart update event
    document.addEventListener('updateCharts', () => {
        updateAllCharts();
    });
}

// ============= GLOBAL FUNCTIONS (GỌI TỪ HANDLER) =============
// Những hàm này chỉ dispatch đến module chính

window.switchTab = switchTab;
window.processTransaction = processTransaction;
window.updateAllCharts = updateAllCharts;
window.testOpenRouter = testOpenRouter;
window.testGemini = testGemini;
window.saveSettings = saveAPISettings;

// Handler xóa giao dịch (global)
window.deleteTransactionHandler = (index) => {
    if (confirm('Bạn có chắc muốn xóa giao dịch này?')) {
        deleteTransaction(index);
        updateTransactionList();
        updateSummaryCards();
    }
};

// Handler xóa ảnh (global)
window.removeImageHandler = (index) => {
    removeImage(index);
};

// ============= KHỞI TẠO KHI DOM READY =============
// Chỉ chạy 1 lần khi DOM sẵn sàng
if (document.readyState === 'loading') {
    // DOM still loading
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM already loaded
    initApp();
}