// ai-processor.js - Xử lý gọi AI và phân tích giao dịch
// ======================================================

import { appState, addTransaction } from './storage.js';
import { 
    showMessage, 
    setButtonState, 
    clearInputs,
    updateTransactionList,
    updateSummaryCards 
} from './ui.js';
import { getUploadedImagesCount, clearUploadedImages } from './image-handler.js';
import { 
    isProviderConfigured, 
    getActiveAPIKey, 
    getActiveModel 
} from './api-config.js';

// Prompt hệ thống
const SYSTEM_PROMPT = `Bạn là trợ lý phân tích giao dịch tài chính. Nhiệm vụ của bạn là phân tích văn bản tiếng Việt về giao dịch và/hoặc hình ảnh hóa đơn/biên lai, sau đó trả về JSON với format sau:
{
  "transactions": [
    {
      "type": "income" hoặc "expense",
      "amount": số tiền (chỉ số, không có đơn vị),
      "category": "Lương|Đầu tư|Thưởng|Thực phẩm|Giải trí|Mua sắm|Y tế|Giáo dục|Đi lại|Khác",
      "description": "mô tả ngắn gọn"
    }
  ]
}

Lưu ý:
- Chuyển đổi "triệu", "tr" thành 1000000, "k", "nghìn" thành 1000
- type: "income" cho thu nhập, "expense" cho chi tiêu
- amount: chỉ trả về số, VD: 2000000 (không phải "2 triệu")
- Nếu có hình ảnh hóa đơn, hãy đọc và trích xuất thông tin từ ảnh
- Chỉ trả về JSON, không có text khác`;

// Xử lý giao dịch
export async function processTransaction() {
    const input = document.getElementById('naturalInput').value.trim();
    const hasImages = getUploadedImagesCount() > 0;
    
    if (!input && !hasImages) {
        showMessage('Vui lòng nhập giao dịch hoặc tải lên ảnh hóa đơn', 'error');
        return;
    }

    if (!isProviderConfigured()) {
        showMessage('Vui lòng cấu hình API trong phần Cài đặt AI', 'error');
        return;
    }

    setButtonState('processBtn', true, 'Đang xử lý...');
    
    const message = hasImages 
        ? `AI đang phân tích ${getUploadedImagesCount()} ảnh hóa đơn...`
        : 'AI đang phân tích giao dịch...';
    
    showMessage(message, 'loading');

    try {
        const aiResponse = await callAI(input);
        const transactions = parseAIResponse(aiResponse);

        if (!transactions || transactions.length === 0) {
            throw new Error('Không thể phân tích được giao dịch nào');
        }

        // Thêm các giao dịch
        transactions.forEach(t => {
            addTransaction(t);
        });

        // Cập nhật UI
        updateTransactionList();
        updateSummaryCards();
        clearInputs();
        clearUploadedImages();
        
        const imageText = hasImages 
            ? ` từ ${getUploadedImagesCount()} ảnh` 
            : '';
        showMessage(
            `Đã thêm ${transactions.length} giao dịch${imageText} thành công!`,
            'success'
        );

    } catch (error) {
        showMessage('Lỗi: ' + error.message, 'error');
    } finally {
        setButtonState('processBtn', false, 'Xử Lý Giao Dịch');
    }
}

// Gọi API AI
async function callAI(userInput) {
    const activeProvider = appState.settings.activeProvider;
    
    if (activeProvider === 'openrouter') {
        return callOpenRouter(userInput);
    } else if (activeProvider === 'gemini') {
        return callGemini(userInput);
    }
    
    throw new Error('Provider không được hỗ trợ');
}

// Gọi OpenRouter API
async function callOpenRouter(userInput) {
    const messages = [
        { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Build user message
    const content = [];
    if (userInput) {
        content.push({ type: 'text', text: userInput });
    }
    
    // Add images
    appState.uploadedImages.forEach(img => {
        content.push({
            type: 'image_url',
            image_url: { url: img.dataUrl }
        });
    });

    if (content.length === 0) {
        content.push({ type: 'text', text: 'Hãy phân tích ảnh hóa đơn này' });
    }

    messages.push({ role: 'user', content });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getActiveAPIKey()}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: getActiveModel(),
            messages: messages
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error('Lỗi OpenRouter: ' + (error.error?.message || 'Unknown'));
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// Gọi Gemini API
async function callGemini(userInput) {
    const parts = [];
    
    // Add system prompt and user input
    if (userInput) {
        parts.push({ text: SYSTEM_PROMPT + '\n\nUser: ' + userInput });
    } else {
        parts.push({ 
            text: SYSTEM_PROMPT + '\n\nUser: Hãy phân tích hóa đơn/biên lai trong ảnh:' 
        });
    }

    // Add images
    appState.uploadedImages.forEach(img => {
        parts.push({
            inline_data: {
                mime_type: 'image/jpeg',
                data: img.base64
            }
        });
    });

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${getActiveModel()}:generateContent?key=${getActiveAPIKey()}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ parts: parts }]
            })
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error('Lỗi Gemini: ' + (error.error?.message || 'Unknown'));
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// Parse phản hồi từ AI
function parseAIResponse(response) {
    try {
        // Tìm JSON trong response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            throw new Error('Không tìm thấy JSON trong phản hồi');
        }

        const parsed = JSON.parse(jsonMatch[0]);
        
        if (!Array.isArray(parsed.transactions)) {
            throw new Error('Format JSON không hợp lệ');
        }

        // Validate mỗi transaction
        return parsed.transactions.filter(t => {
            return t.type && 
                   (t.type === 'income' || t.type === 'expense') &&
                   t.amount && 
                   Number.isFinite(t.amount) &&
                   t.category && 
                   t.description;
        });

    } catch (error) {
        console.error('Lỗi parse JSON:', error);
        throw new Error('Không thể phân tích phản hồi từ AI');
    }
}