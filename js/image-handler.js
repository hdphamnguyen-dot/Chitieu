// image-handler.js - Xử lý upload, nén và hiển thị ảnh
// ====================================================

import { appState } from './storage.js';

// Khởi tạo các sự kiện liên quan đến upload ảnh
export function initImageUpload() {
    const area = document.getElementById('uploadArea');
    const input = document.getElementById('imageInput');

    if (!area || !input) return;

    // Khi nhấn vào vùng upload
    area.onclick = () => input.click();

    // Khi chọn file xong
    input.onchange = (e) => handleFiles(e.target.files);

    // Xử lý kéo thả ảnh (Drag & Drop)
    area.addEventListener('dragover', (e) => {
        e.preventDefault();
        area.style.backgroundColor = '#f0f7ff';
    });

    area.addEventListener('dragleave', () => {
        area.style.backgroundColor = '';
    });

    area.addEventListener('drop', (e) => {
        e.preventDefault();
        area.style.backgroundColor = '';
        handleFiles(e.dataTransfer.files);
    });
}

// Hàm xử lý các file ảnh được chọn
async function handleFiles(files) {
    for (let file of files) {
        if (!file.type.startsWith('image/')) continue;

        const reader = new FileReader();
        reader.onload = (e) => {
            // Lưu ảnh dưới dạng Base64 để gửi cho AI và DataUrl để hiển thị preview
            const base64 = e.target.result.split(',')[1];
            appState.uploadedImages.push({ 
                dataUrl: e.target.result, 
                base64: base64 
            });
            displayPreviews();
        };
        reader.readAsDataURL(file);
    }
}

// Hiển thị các ảnh nhỏ (thumbnail) đã chọn lên màn hình
function displayPreviews() {
    const previewContainer = document.getElementById('imagePreview');
    if (!previewContainer) return;

    previewContainer.innerHTML = appState.uploadedImages.map((img, index) => `
        <div class="image-preview-item" style="position: relative; display: inline-block; margin: 5px;">
            <img src="${img.dataUrl}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px; border: 1px solid #ddd;">
            <button onclick="window.removeImageHandler(${index})" style="position: absolute; top: -5px; right: -5px; background: red; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px;">×</button>
        </div>
    `).join('');
}

// Hàm xóa một ảnh cụ thể khi nhấn dấu X
export function removeImage(index) {
    appState.uploadedImages.splice(index, 1);
    displayPreviews();
}

// --- ĐÂY LÀ HÀM QUAN TRỌNG BỊ THIẾU CỦA BẠN ---
// Hàm xóa toàn bộ ảnh (gọi sau khi AI xử lý xong)
export function clearUploadedImages() {
    appState.uploadedImages = [];
    displayPreviews();
}