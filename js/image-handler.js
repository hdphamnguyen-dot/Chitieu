// image-handler.js - Xử lý upload, nén và preview ảnh
// ====================================================

import { appState } from './storage.js';

// Khởi tạo upload ảnh
export function initImageUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');

    // Click để chọn ảnh
    uploadArea.addEventListener('click', () => {
        imageInput.click();
    });

    // Drag over
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    // Drag leave
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    // Drop
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    // Change
    imageInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
}

// Xử lý files
async function handleFiles(files) {
    for (let file of files) {
        if (file.type.startsWith('image/')) {
            try {
                const compressed = await compressImage(file);
                appState.uploadedImages.push(compressed);
            } catch (error) {
                console.error('Lỗi nén ảnh:', error);
            }
        }
    }
    displayImagePreviews();
}

// Nén ảnh
function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resize tối đa 1024px
                const maxSize = 1024;
                if (width > height && width > maxSize) {
                    height = (height * maxSize) / width;
                    width = maxSize;
                } else if (height > maxSize) {
                    width = (width * maxSize) / height;
                    height = maxSize;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to JPEG 60% quality
                canvas.toBlob((blob) => {
                    const reader2 = new FileReader();
                    reader2.onloadend = () => {
                        resolve({
                            dataUrl: reader2.result,
                            base64: reader2.result.split(',')[1]
                        });
                    };
                    reader2.readAsDataURL(blob);
                }, 'image/jpeg', 0.6);
            };
            
            img.onerror = () => reject(new Error('Không thể tải ảnh'));
            img.src = e.target.result;
        };
        
        reader.onerror = () => reject(new Error('Không thể đọc file'));
        reader.readAsDataURL(file);
    });
}

// Hiển thị preview ảnh
export function displayImagePreviews() {
    const previewDiv = document.getElementById('imagePreview');
    
    if (appState.uploadedImages.length === 0) {
        previewDiv.innerHTML = '';
        return;
    }
    
    previewDiv.innerHTML = appState.uploadedImages
        .map((img, index) => `
            <div class="image-preview-item">
                <img src="${img.dataUrl}" alt="Preview">
                <button class="remove-image" onclick="window.removeImageHandler(${index})">
                    ×
                </button>
            </div>
        `).join('');
}

// Xóa ảnh
export function removeImage(index) {
    appState.uploadedImages.splice(index, 1);
    displayImagePreviews();
}

// Lấy số ảnh đã upload
export function getUploadedImagesCount() {
    return appState.uploadedImages.length;
}

// Xóa tất cả ảnh
export function clearUploadedImages() {
    appState.uploadedImages = [];
    displayImagePreviews();
}