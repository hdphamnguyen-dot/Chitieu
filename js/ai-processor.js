import { appState, addTransaction } from './storage.js';
import { 
    showMessage, 
    updateTransactionList, 
    updateSummaryCards, 
    clearInputs 
} from './ui.js';
import { clearUploadedImages } from './image-handler.js';
import { getActiveAPIKey, getActiveModel, isProviderConfigured } from './api-config.js';

const SYSTEM_PROMPT = `Bạn là trợ lý tài chính. Nhiệm vụ của bạn là phân tích văn bản hoặc ảnh hóa đơn và trả về DUY NHẤT một mã JSON theo định dạng sau:
{
  "transactions": [
    {
      "type": "income" hoặc "expense",
      "amount": số tiền (ví dụ: 50000),
      "category": "Tên hạng mục",
      "description": "Mô tả ngắn"
    }
  ]
}
Lưu ý: Không viết thêm bất kỳ lời giải thích nào ngoài mã JSON.`;

export async function processTransaction() {
    if (!isProviderConfigured()) {
        return showMessage('Bạn chưa cài đặt API Key trong phần Cài đặt!', 'error');
    }

    const input = document.getElementById('naturalInput').value.trim();
    const hasImages = appState.uploadedImages.length > 0;

    if (!input && !hasImages) {
        return showMessage('Hãy nhập nội dung hoặc tải ảnh lên nhé!', 'error');
    }

    showMessage('AI đang suy nghĩ...', 'loading');

    try {
        const parts = [{ text: SYSTEM_PROMPT + "\nDữ liệu người dùng: " + input }];
        
        // Gửi kèm ảnh nếu có
        appState.uploadedImages.forEach(img => {
            parts.push({
                inline_data: {
                    mime_type: "image/jpeg",
                    data: img.base64
                }
            });
        });

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${getActiveModel()}:generateContent?key=${getActiveAPIKey()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts }] })
        });

        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;

        // BƯỚC QUAN TRỌNG: Tìm phần JSON nằm giữa dấu { và }
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            
            if (result.transactions && result.transactions.length > 0) {
                result.transactions.forEach(t => addTransaction(t));
                
                // Cập nhật giao diện ngay lập tức
                updateTransactionList();
                updateSummaryCards();
                clearInputs();
                clearUploadedImages();
                
                showMessage(`Đã thêm ${result.transactions.length} giao dịch thành công!`, 'success');
                
                // Kích hoạt cập nhật biểu đồ
                document.dispatchEvent(new Event('updateCharts'));
            }
        } else {
            throw new Error('AI trả về kết quả không đúng định dạng JSON.');
        }

    } catch (error) {
        console.error('Lỗi AI:', error);
        showMessage('Lỗi: AI không phân tích được dữ liệu này.', 'error');
    }
}