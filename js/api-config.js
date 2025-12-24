import { appState, saveData } from './storage.js';
import { showMessage, updateStatusIndicators } from './ui.js';

// Kiểm tra kết nối OpenRouter
export async function testOpenRouter() {
    const keyEl = document.getElementById('openrouterKey');
    if (!keyEl) return;
    
    const key = keyEl.value;
    if (!key) return showMessage('Cần API Key OpenRouter!', 'error');

    try {
        showMessage('Đang kiểm tra OpenRouter...', 'loading');
        const res = await fetch('https://openrouter.ai/api/v1/models', { 
            headers: { 'Authorization': `Bearer ${key}` } 
        });
        
        if (!res.ok) throw new Error('Key không hợp lệ');
        
        const data = await res.json();
        const select = document.getElementById('openrouterModel');
        
        if (select) {
            select.innerHTML = data.data.map(m => `<option value="${m.id}">${m.id}</option>`).join('');
            select.disabled = false;
        }

        appState.settings.openrouter.key = key;
        appState.settings.openrouter.connected = true;
        updateStatusIndicators();
        showMessage('Kết nối OpenRouter thành công!', 'success');
    } catch (e) { 
        showMessage('Lỗi kết nối OpenRouter. Kiểm tra lại Key!', 'error'); 
    }
}

// Kiểm tra kết nối Gemini
export async function testGemini() {
    const keyEl = document.getElementById('geminiKey');
    if (!keyEl) return;

    const key = keyEl.value;
    if (!key) return showMessage('Cần API Key Gemini!', 'error');

    try {
        showMessage('Đang kiểm tra Gemini...', 'loading');
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        
        if (!res.ok) throw new Error('Key không hợp lệ');

        const data = await res.json();
        const select = document.getElementById('geminiModel');
        
        if (select) {
            select.innerHTML = data.models
                .filter(m => m.name.includes('gemini'))
                .map(m => `<option value="${m.name}">${m.displayName || m.name}</option>`).join('');
            select.disabled = false;
        }

        appState.settings.gemini.key = key;
        appState.settings.gemini.connected = true;
        updateStatusIndicators();
        showMessage('Kết nối Gemini thành công!', 'success');
    } catch (e) { 
        showMessage('Lỗi kết nối Gemini. Kiểm tra lại Key!', 'error'); 
    }
}

// Lưu cài đặt khi nhấn nút
export function saveAPISettings() {
    const orModel = document.getElementById('openrouterModel');
    const geModel = document.getElementById('geminiModel');
    const provider = document.getElementById('activeProvider');

    if (orModel) appState.settings.openrouter.model = orModel.value;
    if (geModel) appState.settings.gemini.model = geModel.value;
    if (provider) appState.settings.activeProvider = provider.value;

    saveData();
    showMessage('Đã lưu cấu hình API!', 'success');
}

// Kiểm tra xem đã cài đặt API chưa
export function isProviderConfigured() {
    const p = appState.settings.activeProvider;
    if (!p) return false;
    if (p === 'gemini') {
        return appState.settings.gemini.key && appState.settings.gemini.model;
    } else {
        return appState.settings.openrouter.key && appState.settings.openrouter.model;
    }
}

export function getActiveAPIKey() {
    return appState.settings.activeProvider === 'gemini' 
        ? appState.settings.gemini.key 
        : appState.settings.openrouter.key;
}

export function getActiveModel() {
    return appState.settings.activeProvider === 'gemini' 
        ? appState.settings.gemini.model 
        : appState.settings.openrouter.model;
}

// --- ĐÂY LÀ HÀM BỊ LỖI CỦA EM ĐÃ ĐƯỢC SỬA ---
export function loadAPISettingsToForm() {
    const gKey = document.getElementById('geminiKey');
    const oKey = document.getElementById('openrouterKey');
    const aProv = document.getElementById('activeProvider');

    // Chỉ điền giá trị nếu tìm thấy các ô nhập liệu trong HTML
    if (gKey) gKey.value = appState.settings.gemini.key || '';
    if (oKey) oKey.value = appState.settings.openrouter.key || '';
    if (aProv) aProv.value = appState.settings.activeProvider || '';
    
    updateStatusIndicators();
}