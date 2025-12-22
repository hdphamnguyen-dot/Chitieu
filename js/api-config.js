import { appState, saveData } from './storage.js';
import { showMessage, updateStatusIndicators } from './ui.js';

export async function testOpenRouter() {
    const key = document.getElementById('openrouterKey').value;
    if (!key) return showMessage('Cần API Key!', 'error');
    try {
        const res = await fetch('https://openrouter.ai/api/v1/models', { headers: { 'Authorization': `Bearer ${key}` } });
        const data = await res.json();
        const select = document.getElementById('openrouterModel');
        select.innerHTML = data.data.map(m => `<option value="${m.id}">${m.id}</option>`).join('');
        select.disabled = false;
        appState.settings.openrouter.key = key;
        appState.settings.openrouter.connected = true;
        updateStatusIndicators();
        showMessage('Kết nối OpenRouter xong!', 'success');
    } catch (e) { showMessage('Lỗi OpenRouter', 'error'); }
}

export async function testGemini() {
    const key = document.getElementById('geminiKey').value;
    if (!key) return showMessage('Cần API Key!', 'error');
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await res.json();
        const select = document.getElementById('geminiModel');
        select.innerHTML = data.models.filter(m => m.name.includes('gemini')).map(m => `<option value="${m.name}">${m.displayName || m.name}</option>`).join('');
        select.disabled = false;
        appState.settings.gemini.key = key;
        appState.settings.gemini.connected = true;
        updateStatusIndicators();
        showMessage('Kết nối Gemini xong!', 'success');
    } catch (e) { showMessage('Lỗi Gemini', 'error'); }
}

export function saveAPISettings() {
    appState.settings.openrouter.model = document.getElementById('openrouterModel').value;
    appState.settings.gemini.model = document.getElementById('geminiModel').value;
    appState.settings.activeProvider = document.getElementById('activeProvider').value;
    saveData();
    showMessage('Đã lưu!', 'success');
}

export function isProviderConfigured() {
    const p = appState.settings.activeProvider;
    if (!p) return false;
    return p === 'gemini' ? (appState.settings.gemini.key && appState.settings.gemini.model) : (appState.settings.openrouter.key && appState.settings.openrouter.model);
}

export function getActiveAPIKey() {
    return appState.settings.activeProvider === 'gemini' ? appState.settings.gemini.key : appState.settings.openrouter.key;
}

export function getActiveModel() {
    return appState.settings.activeProvider === 'gemini' ? appState.settings.gemini.model : appState.settings.openrouter.model;
}

export function loadAPISettingsToForm() {
    document.getElementById('geminiKey').value = appState.settings.gemini.key;
    document.getElementById('openrouterKey').value = appState.settings.openrouter.key;
    document.getElementById('activeProvider').value = appState.settings.activeProvider;
    updateStatusIndicators();
}