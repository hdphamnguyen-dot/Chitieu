import { loadData, deleteTransaction } from './storage.js';
import { switchTab, updateTransactionList, updateSummaryCards } from './ui.js';
import { initImageUpload, removeImage } from './image-handler.js';
import { loadAPISettingsToForm, saveAPISettings, testOpenRouter, testGemini } from './api-config.js';
import { processTransaction } from './ai-processor.js';
import { updateAllCharts } from './charts.js';

document.addEventListener('DOMContentLoaded', () => {
    loadData(); initImageUpload(); loadAPISettingsToForm();
    updateSummaryCards(); updateTransactionList();
    
    document.querySelectorAll('.tab').forEach((b, i) => b.onclick = () => switchTab(['main', 'charts', 'settings'][i]));
    document.getElementById('processBtn').onclick = processTransaction;
    document.getElementById('geminiTestBtn').onclick = testGemini;
    document.getElementById('openrouterTestBtn').onclick = testOpenRouter;
    document.getElementById('saveSettingsBtn').onclick = saveAPISettings;
    document.getElementById('chartFilter').onchange = updateAllCharts;
    document.addEventListener('updateCharts', updateAllCharts);
});

window.deleteTransactionHandler = (i) => { deleteTransaction(i); updateTransactionList(); updateSummaryCards(); };
window.removeImageHandler = (i) => removeImage(i);