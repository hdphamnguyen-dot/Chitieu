// api-config.js - Quản lý cấu hình API
// ======================================

import { appState, updateSettings, saveData } from './storage.js';
import { 
    showMessage, 
    updateStatusIndicators, 
    updateModelSelect, 
    setSelectDisabled,
    getInputValue,
    setInputValue 
} from './ui.js';

// Kiểm tra OpenRouter API
export async function testOpenRouter() {
    const key = getInputValue('openrouterKey');
    
    if (!key) {
        showMessage('Vui lòng nhập API key', 'error');
        return;
    }

    showMessage('Đang kiểm tra kết nối...', 'loading');

    try {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
            headers: {
                'Authorization': `Bearer ${key}`
            }
        });

        if (!response.ok) {
            throw new Error('Không thể kết nối');
        }

        const data = await response.json();
        
        updateModelSelect(
            'openrouterModel',
            data.data,
            (model) => `${model.id} ${model.name ? '- ' + model.name : ''}`
        );

        appState.settings.openrouter.key = key;
        appState.settings.openrouter.connected = true;
        updateStatusIndicators();
        showMessage('Kết nối thành công! Vui lòng chọn model.', 'success');
        
    } catch (error) {
        showMessage('Lỗi: ' + error.message, 'error');
        appState.settings.openrouter.connected = false;
        setSelectDisabled('openrouterModel', true);
        updateStatusIndicators();
    }
}

// Kiểm tra Gemini API
export async function testGemini() {
    const key = getInputValue('geminiKey');
    
    if (!key) {
        showMessage('Vui lòng nhập API key', 'error');
        return;
    }

    showMessage('Đang kiểm tra kết nối...', 'loading');

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
        );

        if (!response.ok) {
            throw new Error('Không thể kết nối');
        }

        const data = await response.json();
        
        const geminiModels = data.models.filter(m => 
            m.name.includes('gemini')
        );
        
        updateModelSelect(
            'geminiModel',
            geminiModels,
            (model) => model.displayName || model.name
        );

        appState.settings.gemini.key = key;
        appState.settings.gemini.connected = true;
        updateStatusIndicators();
        showMessage('Kết nối thành công! Vui lòng chọn model.', 'success');
        
    } catch (error) {
        showMessage('Lỗi: ' + error.message, 'error');
        appState.settings.gemini.connected = false;
        setSelectDisabled('geminiModel', true);
        updateStatusIndicators();
    }
}

// Lưu cấu hình API
export function saveAPISettings() {
    const orModel = document.getElementById('openrouterModel').value;
    const geminiModel = document.getElementById('geminiModel').value;
    const activeProvider = document.getElementById('activeProvider').value;

    if (!activeProvider) {
        showMessage('Vui lòng chọn API để sử dụng', 'error');
        return false;
    }

    if (activeProvider === 'openrouter' && !orModel) {
        showMessage('Vui lòng chọn model cho OpenRouter', 'error');
        return false;
    }

    if (activeProvider === 'gemini' && !geminiModel) {
        showMessage('Vui lòng chọn model cho Gemini', 'error');
        return false;
    }

    appState.settings.openrouter.model = orModel;
    appState.settings.gemini.model = geminiModel;
    appState.settings.activeProvider = activeProvider;
    
    saveData();
    showMessage('Đã lưu cài đặt thành công!', 'success');
    return true;
}

// Load cài đặt API vào form
export function loadAPISettingsToForm() {
    const { openrouter, gemini, activeProvider } = appState.settings;
    
    setInputValue('openrouterKey', openrouter.key);
    setInputValue('geminiKey', gemini.key);
    document.getElementById('activeProvider').value = activeProvider;
    
    // Set selected models
    if (openrouter.model) {
        document.getElementById('openrouterModel').value = openrouter.model;
    }
    if (gemini.model) {
        document.getElementById('geminiModel').value = gemini.model;
    }
    
    updateStatusIndicators();
}

// Kiểm tra provider đã được cấu hình
export function isProviderConfigured() {
    const provider = appState.settings.activeProvider;
    
    if (!provider) return false;
    
    if (provider === 'openrouter') {
        return appState.settings.openrouter.key && 
               appState.settings.openrouter.model;
    }
    
    if (provider === 'gemini') {
        return appState.settings.gemini.key && 
               appState.settings.gemini.model;
    }
    
    return false;
}

// Lấy API key đang sử dụng
export function getActiveAPIKey() {
    const provider = appState.settings.activeProvider;
    
    if (provider === 'openrouter') {
        return appState.settings.openrouter.key;
    }
    
    if (provider === 'gemini') {
        return appState.settings.gemini.key;
    }
    
    return null;
}

// Lấy model đang sử dụng
export function getActiveModel() {
    const provider = appState.settings.activeProvider;
    
    if (provider === 'openrouter') {
        return appState.settings.openrouter.model;
    }
    
    if (provider === 'gemini') {
        return appState.settings.gemini.model;
    }
    
    return null;
}