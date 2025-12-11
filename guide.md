# 💰 Quản Lý Chi Tiêu Thông Minh - Hướng Dẫn

## 📁 Cấu Trúc Thư Mục

```
expense-manager/
├── index.html                 # File HTML chính
├── css/
│   └── styles.css            # Tất cả styles
├── js/
│   ├── main.js               # Khởi tạo & quản lý ứng dụng
│   ├── storage.js            # Quản lý lưu trữ dữ liệu
│   ├── ui.js                 # Quản lý giao diện & tabs
│   ├── image-handler.js      # Xử lý upload & nén ảnh
│   ├── api-config.js         # Quản lý cấu hình API
│   ├── ai-processor.js       # Xử lý gọi AI phân tích
│   └── charts.js             # Quản lý biểu đồ thống kê
└── README.md                 # File này
```

## 🚀 Cách Cài Đặt

### 1. Chuẩn Bị Các File
Tạo thư mục dự án với cấu trúc trên, sau đó:
- Sao chép `index.html` vào thư mục gốc
- Sao chép `styles.css` vào thư mục `css/`
- Sao chép tất cả files `.js` vào thư mục `js/`

### 2. Chạy Ứng Dụng
Bạn có thể chạy bằng:
- **HTTP Server**: `python -m http.server 8000` (Python 3)
- **Node.js**: `npx http-server`
- Hoặc upload lên server web

> ⚠️ Lưu ý: Do sử dụng ES6 modules, cần chạy trên server (không phải mở file:// trực tiếp)

### 3. Cấu Hình API
1. Mở ứng dụng → Chọn tab "Cài Đặt AI"
2. Chọn một trong hai API:
   - **OpenRouter**: Lấy API key từ https://openrouter.ai
   - **Google Gemini**: Lấy API key từ https://ai.google.dev
3. Nhập API key và nhấn "Kiểm Tra & Lấy Danh Sách Model"
4. Chọn model phù hợp
5. Nhấn "Lưu Cài Đặt"

## 📖 Mô Tả Các Module

### `storage.js`
**Quản lý dữ liệu ứng dụng**
- `loadData()` - Tải dữ liệu từ localStorage
- `saveData()` - Lưu dữ liệu vào localStorage
- `addTransaction()` - Thêm giao dịch mới
- `deleteTransaction()` - Xóa giao dịch
- `calculateTotals()` - Tính tổng thu/chi
- `getFilteredTransactions()` - Lọc theo thời gian

**Exports:**
```javascript
export const appState = { transactions, settings, uploadedImages }
```

### `ui.js`
**Quản lý giao diện người dùng**
- `switchTab()` - Chuyển đổi giữa các tab
- `formatMoney()` - Định dạng tiền tệ VNĐ
- `showMessage()` - Hiển thị thông báo
- `updateSummaryCards()` - Cập nhật thẻ thống kê
- `updateTransactionList()` - Cập nhật danh sách giao dịch
- `updateStatusIndicators()` - Cập nhật trạng thái API

### `image-handler.js`
**Xử lý upload ảnh**
- `initImageUpload()` - Khởi tạo drag-drop
- `handleFiles()` - Xử lý file ảnh
- `compressImage()` - Nén ảnh (max 1024px)
- `displayImagePreviews()` - Hiển thị preview
- `removeImage()` - Xóa ảnh

### `api-config.js`
**Cấu hình API**
- `testOpenRouter()` - Kiểm tra & lấy models OpenRouter
- `testGemini()` - Kiểm tra & lấy models Gemini
- `saveAPISettings()` - Lưu cài đặt API
- `isProviderConfigured()` - Kiểm tra provider sẵn sàng
- `getActiveAPIKey()` - Lấy API key đang dùng

### `ai-processor.js`
**Xử lý AI phân tích**
- `processTransaction()` - Xử lý giao dịch từ input/ảnh
- `callAI()` - Gọi API AI
- `callOpenRouter()` - Gọi OpenRouter API
- `callGemini()` - Gọi Gemini API
- `parseAIResponse()` - Parse JSON từ AI

### `charts.js`
**Quản lý biểu đồ**
- `updateAllCharts()` - Cập nhật tất cả biểu đồ
- `updateIncomeExpenseChart()` - Biểu đồ thu/chi
- `updateCategoryPieChart()` - Biểu đồ phân bổ category
- `updateTrendChart()` - Biểu đồ xu hướng
- `updateTopCategoriesChart()` - Top 5 categories

### `main.js`
**Khởi tạo ứng dụng**
- `initApp()` - Khởi tạo toàn bộ ứng dụng
- `setupEventListeners()` - Thiết lập event listeners
- Export global functions cho HTML

## 🎯 Hướng Dẫn Sử Dụng

### Nhập Giao Dịch
1. Nhập văn bản tự nhiên, ví dụ:
   - "Hôm nay tôi có thu nhập 2 triệu từ lương"
   - "Chi tiêu 500k mua thực phẩm và 200k mua sách"

2. Hoặc tải ảnh hóa đơn (drag-drop hoặc click)

3. Nhấn "Xử Lý Giao Dịch"

4. AI sẽ phân tích và thêm giao dịch vào danh sách

### Xem Biểu Đồ
- Chọn tab "Biểu Đồ"
- Lọc theo thời gian (7 ngày, 30 ngày, v.v.)
- Xem 4 biểu đồ:
  - Thu nhập vs Chi tiêu
  - Phân bổ chi tiêu theo category
  - Xu hướng theo thời gian
  - Top 5 categories

## 🔧 Mở Rộng & Bảo Trì

### Thêm Category Mới
Chỉnh sửa trong `ai-processor.js` (dòng category):
```javascript
"category": "Lương|Đầu tư|Thưởng|...|YourNewCategory"
```

### Thêm API Provider Mới
1. Thêm function trong `api-config.js`
2. Thêm case mới trong `ai-processor.js`
3. Cập nhật HTML form trong `index.html`

### Tùy Chỉnh Style
Chỉnh sửa `css/styles.css`

### Tùy Chỉnh Prompts
Sửa `SYSTEM_PROMPT` trong `ai-processor.js`

## 🐛 Troubleshooting

### Lỗi: "Modules are not defined"
→ Chắc chắn chạy trên HTTP server, không phải file://

### Lỗi API: "Unauthorized"
→ Kiểm tra API key có đúng không

### Ảnh không nén được
→ Kiểm tra format (JPG, PNG)

### Biểu đồ không hiển thị
→ Kiểm tra console có lỗi gì không

## 💡 Tips & Tricks

1. **Tối ưu hóa ảnh**: App tự động nén ảnh thành max 1024px
2. **Lưu trữ offline**: Dữ liệu lưu trong localStorage
3. **Chế độ tối**: Có thể thêm dark mode bằng CSS
4. **Export dữ liệu**: Có thể thêm tính năng export CSV/PDF

## 📝 License

Miễn phí sử dụng và sửa đổi

## 🤝 Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:
1. Console (F12) có lỗi gì không
2. API settings đã đúng chưa
3. Browser có hỗ trợ ES6 modules không