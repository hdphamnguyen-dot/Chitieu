# 🗺️ Bản Đồ Kiến Trúc - Quản Lý Chi Tiêu Thông Minh

## 📚 Giới Thiệu Nhanh

Ứng dụng quản lý chi tiêu sử dụng **AI để tự động phân loại giao dịch** từ:
- ✍️ **Văn bản tự nhiên**: "Hôm nay chi 500k mua thực phẩm"
- 📸 **Ảnh hóa đơn**: Upload ảnh, AI sẽ trích xuất thông tin

**Quy trình chính:**
```
Người dùng nhập → AI phân tích → Parse JSON → Lưu dữ liệu → Hiển thị
```

---

## 🏗️ Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────┐
│         index.html (Giao diện)          │ ← Người dùng tương tác
└────────────────────┬────────────────────┘
                     │
                     ↓
        ┌────────────────────────┐
        │   js/main.js           │
        │ (Khởi tạo & điều phối) │
        └────────────────────────┘
                     │
        ┌────────────┼────────────┬──────────────┬─────────────┐
        ↓            ↓            ↓              ↓             ↓
    ┌────────┐  ┌───────┐  ┌──────────┐  ┌────────────┐  ┌────────┐
    │storage │  │ ui.js │  │image-    │  │api-config  │  │charts  │
    │.js     │  │       │  │handler   │  │.js         │  │.js     │
    └────────┘  └───────┘  └──────────┘  └────────────┘  └────────┘
        │            │            │              │
        └────────────┼────────────┬──────────────┘
                     │
                     ↓
        ┌────────────────────────┐
        │ ai-processor.js        │
        │ (Gọi API & phân tích)  │
        └────────────────────────┘
                     │
                     ↓
        ┌────────────────────────┐
        │  API (OpenRouter/Gemini)
        └────────────────────────┘

        🗄️ localStorage (Lưu dữ liệu)
```

---

## 📄 Danh Sách File & Chức Năng

### 1️⃣ `index.html` - Giao Diện Người Dùng

**Chức năng:** Cấu trúc HTML, không chứa logic

**Các phần chính:**
```html
<header>          <!-- Logo, tab navigation -->
<main-tab>        <!-- Input, upload, danh sách giao dịch -->
<charts-tab>      <!-- Biểu đồ thống kê -->
<settings-tab>    <!-- Cấu hình API -->
```

**Script import:**
```html
<script type="module" src="js/main.js"></script>
```

---

### 2️⃣ `css/styles.css` - Toàn Bộ CSS

**Phân loại styles:**
- `.header` - Phần đầu trang
- `.tabs` - Navigation tabs
- `.card` - Thẻ tóm tắt (Tổng thu/chi)
- `.transaction-item` - Item giao dịch
- `.chart-container` - Vùng biểu đồ
- `.image-upload-area` - Vùng drag-drop ảnh
- `.input-group` - Form input

**Responsive:** Tự động trên mobile (grid 1 cột)

---

### 3️⃣ `js/main.js` - Khởi Tạo & Điều Phối

**Vai trò:** Điểm vào duy nhất, khởi tạo tất cả modules

**Hàm chính:**

| Hàm | Mô tả |
|-----|-------|
| `initApp()` | Khởi tạo: load dữ liệu → init image → load API → update UI |
| `setupEventListeners()` | Gắn sự kiện cho nút, tab, filter |

**Import từ các modules:**
```javascript
import { loadData, saveData, ... } from './storage.js'
import { switchTab, showMessage, ... } from './ui.js'
import { initImageUpload, ... } from './image-handler.js'
import { loadAPISettingsToForm, ... } from './api-config.js'
import { processTransaction } from './ai-processor.js'
import { updateAllCharts } from './charts.js'
```

**Global functions cho HTML:**
```javascript
window.switchTab = switchTab
window.processTransaction = processTransaction
window.deleteTransactionHandler = (index) => { ... }
window.removeImageHandler = (index) => { ... }
```

**Quy trình khởi tạo:**
```
1. loadData()              → Tải từ localStorage
2. initImageUpload()       → Gắn drag-drop ảnh
3. loadAPISettingsToForm() → Hiển thị cài đặt API
4. updateSummaryCards()    → Cập nhật tổng thu/chi
5. updateTransactionList() → Hiển thị danh sách
6. setupEventListeners()   → Gắn tất cả sự kiện
```

---

### 4️⃣ `js/storage.js` - Quản Lý Dữ Liệu

**State toàn cục:**
```javascript
appState = {
  transactions: [
    { type: 'income'|'expense', amount: 1000, category: '...', description: '...', date: '2024-...' }
  ],
  settings: {
    openrouter: { key: '', model: '', connected: false },
    gemini: { key: '', model: '', connected: false },
    activeProvider: 'openrouter'|'gemini'
  },
  uploadedImages: [
    { dataUrl: 'data:image/jpeg...', base64: '...' }
  ]
}
```

**Hàm chính:**

| Hàm | Input | Output | Mô tả |
|-----|-------|--------|-------|
| `loadData()` | - | void | Tải transactions & settings từ localStorage |
| `saveData()` | - | void | Lưu tất cả vào localStorage |
| `addTransaction(t)` | transaction object | void | Thêm giao dịch + tự động set date + lưu |
| `deleteTransaction(idx)` | index: number | void | Xóa giao dịch theo index + lưu |
| `updateSettings(obj)` | settings object | void | Cập nhật settings + lưu |
| `getFilteredTransactions(days)` | days: number\|null | transaction[] | Lọc 7/30/90/365 ngày hoặc all |
| `calculateTotals(txns)` | transaction[] | {income, expense, balance} | Tính tổng cộng |
| `clearAllData()` | - | boolean | Xóa tất cả (có confirm) |

**Lưu ý:**
- ✅ `addTransaction()` tự động thêm `date`
- ✅ Mọi thay đổi tự động gọi `saveData()`
- ✅ `getFilteredTransactions(null)` = all transactions

---

### 5️⃣ `js/ui.js` - Quản Lý Giao Diện

**Hàm chính:**

| Hàm | Input | Output | Mô tả |
|-----|-------|--------|-------|
| `formatMoney(amount)` | number | string | Format VND: "1.000.000 ₫" |
| `switchTab(tab)` | 'main'\|'charts'\|'settings' | void | Chuyển tab, trigger updateCharts |
| `showMessage(msg, type)` | msg: string, type: 'success'\|'error'\|'loading' | void | Hiển thị thông báo (auto hide nếu success/error) |
| `updateStatusIndicators()` | - | void | Cập nhật status "Đã kết nối"/"Chưa kết nối" |
| `updateSummaryCards()` | - | void | Cập nhật 3 card: Tổng thu, Chi, Số dư |
| `updateTransactionList()` | - | void | Hiển thị danh sách giao dịch (reverse order) |
| `clearInputs()` | - | void | Xóa textarea & uploaded images |
| `setButtonState(id, disabled, text)` | id, disabled: bool, text: string | void | Vô hiệu hoá/kích hoạt nút + đổi text |
| `getInputValue(id)` | element ID | string | Lấy value input (trim) |
| `setInputValue(id, value)` | id, value: string | void | Set value input |
| `updateModelSelect(selectId, models, displayFn)` | - | void | Populate dropdown models từ API |

**Quy trình chuyển tab:**
```
Nhấn tab → switchTab() → Toggle class active → Nếu charts tab: updateCharts()
```

**Template hiển thị giao dịch:**
```html
<div class="transaction-item">
  <div class="transaction-info">
    <span class="transaction-category">Thực phẩm</span>
    <span>Mô tả giao dịch</span>
    <div class="transaction-date">Thời gian</div>
  </div>
  <div>
    <span class="transaction-amount income">+500.000 ₫</span>
    <button class="delete-btn">Xóa</button>
  </div>
</div>
```

---

### 6️⃣ `js/image-handler.js` - Xử Lý Ảnh

**Quy trình upload:**
```
Drag-drop hoặc Click → handleFiles() → compressImage() → displayImagePreviews()
```

**Hàm chính:**

| Hàm | Input | Output | Mô tả |
|-----|-------|--------|-------|
| `initImageUpload()` | - | void | Gắn drag-drop events |
| `handleFiles(files)` | FileList | async void | Nén từng ảnh rồi thêm vào `appState.uploadedImages` |
| `compressImage(file)` | File object | Promise<{dataUrl, base64}> | Nén max 1024px, chất lượng 60% JPEG |
| `displayImagePreviews()` | - | void | Vẽ preview thumbnails 120x120px |
| `removeImage(index)` | index: number | void | Xóa ảnh khỏi list + redraw |
| `getUploadedImagesCount()` | - | number | Đếm số ảnh |
| `clearUploadedImages()` | - | void | Xóa tất cả ảnh |

**Nén ảnh logic:**
```
1. Load ảnh vào canvas
2. Resize nếu > 1024px (giữ tỷ lệ)
3. Convert to JPEG 60% quality
4. Return dataUrl + base64
```

**Lưu ý:**
- 📸 Format: JPG, PNG (bất kỳ image/*)
- 🎯 Max size: 1024x1024px
- ✂️ Quality: 60% JPEG (để giảm dung lượng)
- 🔄 Base64 + dataUrl (một cái cho preview, một cái cho API)

---

### 7️⃣ `js/api-config.js` - Cấu Hình API

**Hàm chính:**

| Hàm | Input | Output | Mô tả |
|-----|-------|--------|-------|
| `testOpenRouter()` | - | async void | Gọi https://openrouter.ai/api/v1/models, populate dropdown |
| `testGemini()` | - | async void | Gọi https://generativelanguage.googleapis.com/v1beta/models, populate dropdown |
| `saveAPISettings()` | - | boolean | Validate + lưu model selection vào appState |
| `loadAPISettingsToForm()` | - | void | Hiển thị saved keys + models vào form |
| `isProviderConfigured()` | - | boolean | Kiểm tra active provider có key + model không |
| `getActiveAPIKey()` | - | string\|null | Lấy API key của provider đang dùng |
| `getActiveModel()` | - | string\|null | Lấy model name của provider đang dùng |

**OpenRouter Request:**
```javascript
GET https://openrouter.ai/api/v1/models
Headers: { Authorization: `Bearer ${key}` }
Response: { data: [{id, name}, ...] }
```

**Gemini Request:**
```javascript
GET https://generativelanguage.googleapis.com/v1beta/models?key=${key}
Response: { models: [{name, displayName}, ...] }
```

**Validation:**
```javascript
✓ Provider selected
✓ API key exist
✓ Model selected
```

**Lưu ý:**
- 🔑 API keys lưu trong `appState.settings` → localStorage
- ⚠️ Lưu ý security: không nên expose keys trên client (chỉ demo)
- ✅ Có status indicator "Đã kết nối" / "Chưa kết nối"

---

### 8️⃣ `js/ai-processor.js` - Xử Lý AI & Phân Tích

**Quy trình xử lý giao dịch:**
```
Nhấn "Xử Lý" → processTransaction() 
  → Validate input
  → callAI(text) 
  → Gọi API (OpenRouter hoặc Gemini)
  → Parse JSON response
  → addTransaction() × N
  → Update UI
  → Clear input/images
```

**Hàm chính:**

| Hàm | Input | Output | Mô tả |
|-----|-------|--------|-------|
| `processTransaction()` | - | async void | Main handler từ HTML: validate → gọi AI → lưu |
| `callAI(userInput)` | text: string | Promise<string> | Route đến OpenRouter hoặc Gemini |
| `callOpenRouter(userInput)` | text: string | Promise<string> | POST https://openrouter.ai/api/v1/chat/completions |
| `callGemini(userInput)` | text: string | Promise<string> | POST .../v1beta/{model}:generateContent |
| `parseAIResponse(response)` | JSON string | transaction[] | Extract JSON từ response, validate, return array |

**System Prompt (AI):**
```
Bạn là trợ lý phân tích giao dịch tài chính.
Input: Văn bản tiếng Việt + ảnh hóa đơn
Output: JSON có format:
{
  "transactions": [
    {
      "type": "income" | "expense",
      "amount": 1000000,
      "category": "Lương|Đầu tư|...|Khác",
      "description": "Mô tả ngắn"
    }
  ]
}
```

**OpenRouter API Call:**
```javascript
POST https://openrouter.ai/api/v1/chat/completions
Headers: {
  Authorization: `Bearer ${key}`,
  Content-Type: application/json
}
Body: {
  model: "meta-llama/llama-2-70b-chat",
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: [
      { type: 'text', text: userInput },
      { type: 'image_url', image_url: { url: dataUrl } },  // ← Ảnh
      ...
    ] }
  ]
}
Response: { choices: [{ message: { content: "JSON string" } }] }
```

**Gemini API Call:**
```javascript
POST https://generativelanguage.googleapis.com/v1beta/{model}:generateContent?key=${key}
Headers: { Content-Type: application/json }
Body: {
  contents: [{
    parts: [
      { text: SYSTEM_PROMPT + "\n" + userInput },
      { inline_data: { mime_type: 'image/jpeg', data: base64 } },
      ...
    ]
  }]
}
Response: { candidates: [{ content: { parts: [{ text: "JSON string" }] } }] }
```

**Parse JSON:**
```javascript
// Tìm JSON object đầu tiên trong response
const jsonMatch = response.match(/\{[\s\S]*\}/)
const parsed = JSON.parse(jsonMatch[0])

// Validate mỗi transaction
parsed.transactions.filter(t => 
  t.type && t.amount && t.category && t.description
)
```

**Error Handling:**
```
❌ No input & no images → "Vui lòng nhập giao dịch hoặc tải ảnh"
❌ Provider not configured → "Vui lòng cấu hình API"
❌ AI call failed → "Lỗi: [error message]"
❌ No JSON in response → "Không thể phân tích được giao dịch nào"
```

**Lưu ý:**
- 📝 Hỗ trợ text + ảnh cùng lúc
- 🤖 Prompt tiếng Việt → AI trả JSON
- ✂️ Nên trim prompt whitespace
- 🔄 Parse response sẽ tìm FIRST JSON object
- ⏱️ Nên có timeout cho API call

---

### 9️⃣ `js/charts.js` - Quản Lý Biểu Đồ

**Library:** Chart.js v4.4.0

**Hàm chính:**

| Hàm | Input | Output | Mô tả |
|-----|-------|--------|-------|
| `updateAllCharts()` | - | void | Lấy filter, update tất cả 4 biểu đồ |
| `updateIncomeExpenseChart(data)` | transaction[] | void | Bar chart: Thu nhập vs Chi tiêu vs Số dư |
| `updateCategoryPieChart(data)` | transaction[] | void | Doughnut chart: Phân bổ expense theo category |
| `updateTrendChart(data)` | transaction[] | void | Line chart: Xu hướng income/expense theo ngày |
| `updateTopCategoriesChart(data)` | transaction[] | void | Horizontal bar: Top 5 categories |
| `destroyAllCharts()` | - | void | Hủy tất cả chart instances (cleanup) |

**4 Biểu Đồ:**

#### 1. Income vs Expense (Bar)
```
Labels: [Thu Nhập, Chi Tiêu, Số Dư]
Data: [tổng income, tổng expense, balance]
Color: [xanh, đỏ, tím]
```

#### 2. Category Pie (Doughnut)
```
Labels: [Thực phẩm, Giáo dục, ...]
Data: [500k, 200k, ...]
Tooltip: "Thực phẩm: 500.000 ₫ (25%)"
```

#### 3. Trend (Line)
```
X: Ngày (dd/mm/yyyy)
Y: 2 line - income & expense
Trend: Thể hiện biến động qua thời gian
```

#### 4. Top 5 Categories (Horizontal Bar)
```
Top 5 expense categories
Đảo trục: indexAxis: 'y'
```

**Filter Logic:**
```javascript
chartFilter value:
- 'all'   → tất cả transactions
- '7'     → 7 days from today
- '30'    → 30 days from today
- '90'    → 90 days from today
- '365'   → 365 days from today
```

**Định dạng trục Y:**
```javascript
ticks: {
  callback: (value) => (value / 1000000).toFixed(1) + 'M'
}
// 1000000 → "1.0M"
```

**Lưu ý:**
- 🎨 Destroy chart cũ trước khi vẽ lại (tránh memory leak)
- 📊 Chart.js cần element `<canvas>` tương ứng
- 🔄 `updateAllCharts()` gọi lại cả 4 chart
- ⏱️ Có thể slow nếu data lớn (>10k transactions)

---

## 🔄 Luồng Dữ Liệu (Data Flow)

### Sơ đồ chính:
```
┌─────────────────────────────────────────────────────────────┐
│ USER INTERACTION                                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        ↓                             ↓
    [Text Input]              [Upload Images]
        │                             │
        └──────────────┬──────────────┘
                       │
                       ↓
            ┌──────────────────────┐
            │ processTransaction() │
            └──────────────────────┘
                       │
            ┌──────────┴──────────┐
            ↓                     ↓
        [OpenRouter]         [Gemini]
        API Call             API Call
            │                     │
            └──────────────┬──────┘
                           │
                           ↓
                ┌──────────────────────┐
                │ parseAIResponse()    │
                │ Extract JSON         │
                └──────────────────────┘
                           │
                           ↓
            ┌──────────────────────────┐
            │ addTransaction() × N      │
            │ Save to localStorage     │
            └──────────────────────────┘
                           │
            ┌──────────────┴──────────────┐
            ↓                             ↓
    ┌─────────────────┐         ┌─────────────────┐
    │ updateTransaction│         │ updateCharts()  │
    │ List()           │         │                 │
    └─────────────────┘         └─────────────────┘
            │                             │
            └──────────────┬──────────────┘
                           │
                           ↓
                   ┌──────────────┐
                   │ Render UI    │
                   └──────────────┘
```

---

## 🎯 Key Concepts & Patterns

### 1. **Centralized State Management**
```javascript
// appState ở storage.js là "single source of truth"
export const appState = {
  transactions: [...],
  settings: {...},
  uploadedImages: [...]
}
```

### 2. **Event-Driven Architecture**
```javascript
// HTML → window.function → module function → update appState → update UI

Button.click() → processTransaction() → callAI() → addTransaction() → updateUI()
```

### 3. **Async/Await for API Calls**
```javascript
async function processTransaction() {
  try {
    const response = await callAI(input)
    const transactions = parseAIResponse(response)
    transactions.forEach(addTransaction)
    updateUI()
  } catch (error) {
    showMessage('Lỗi: ' + error.message, 'error')
  }
}
```

### 4. **localStorage for Persistence**
```javascript
saveData() → localStorage.setItem('expenseData', JSON.stringify(appState))
loadData() → appState = JSON.parse(localStorage.getItem('expenseData'))
```

### 5. **Module Pattern (ES6 Modules)**
```javascript
// In main.js
import { loadData, addTransaction } from './storage.js'
import { showMessage } from './ui.js'
// Tất cả share dùng appState từ storage.js
```

---

## 🚨 Các Lưu Ý Khi Phát Triển

### ✅ **WHEN ADDING NEW FEATURE:**

#### 1. **Thêm Category Mới**
- File: `ai-processor.js` (dòng SYSTEM_PROMPT)
- Thay đổi: Thêm vào category list
```javascript
"category": "Lương|Đầu tư|Thưởng|...|YourCategory"
```

#### 2. **Thêm API Provider (ví dụ Claude API)**
**File cần chỉnh:**

**ai-processor.js:**
```javascript
async function callAI(prompt) {
  if (provider === 'claude') return callClaude(prompt)
}

async function callClaude(userInput) {
  // Similar to callOpenRouter/callGemini
  const response = await fetch('https://api.anthropic.com/...')
  // ... return JSON response
}
```

**api-config.js:**
```javascript
export async function testClaude() {
  // Kiểm tra API key
  // Lấy danh sách models
  // Update dropdown
}

export function saveClaude() {
  appState.settings.claude = { key, model, connected }
  saveData()
}
```

**index.html:**
```html
<div class="settings-section">
  <h3>Claude API <span class="api-status" id="claudeStatus">...</span></h3>
  <input type="password" id="claudeKey" placeholder="sk-ant-...">
  <select id="claudeModel"></select>
  <button onclick="testClaude()">Test</button>
</div>
```

#### 3. **Thêm Biểu Đồ Mới (ví dụ Monthly Comparison)**
**charts.js:**
```javascript
function updateMonthlyComparisonChart(data) {
  const ctx = document.getElementById('monthlyComparisonChart')
  const monthlyData = {}
  
  // Aggregate data by month
  // ...
  
  if (charts.monthlyComparison) {
    charts.monthlyComparison.destroy()
  }
  
  charts.monthlyComparison = new Chart(ctx, {
    type: 'bar',
    data: { ... },
    options: { ... }
  })
}

// Add to updateAllCharts()
export function updateAllCharts() {
  // ...
  updateMonthlyComparisonChart(filteredData)
}
```

**index.html:**
```html
<div class="chart-container">
  <h3>Monthly Comparison</h3>
  <canvas id="monthlyComparisonChart"></canvas>
</div>
```

#### 4. **Thêm Validation/Rules**
**storage.js:**
```javascript
export function addTransaction(transaction) {
  // Validation
  if (transaction.amount <= 0) {
    throw new Error('Amount must be > 0')
  }
  if (!['income', 'expense'].includes(transaction.type)) {
    throw new Error('Invalid type')
  }
  
  // Valid categories
  const validCategories = ['Lương', 'Đầu tư', ...]
  if (!validCategories.includes(transaction.category)) {
    throw new Error('Invalid category')
  }
  
  appState.transactions.push({...transaction, date: new Date().toISOString()})
  saveData()
}
```

#### 5. **Thêm Filter Nâng Cao**
**storage.js:**
```javascript
export function getTransactionsByCategory(category) {
  return appState.transactions.filter(t => t.category === category)
}

export function getTransactionsByType(type) {
  return appState.transactions.filter(t => t.type === type)
}

export function getTransactionsByDateRange(startDate, endDate) {
  return appState.transactions.filter(t => {
    const date = new Date(t.date)
    return date >= startDate && date <= endDate
  })
}
```

---

### ⚠️ **COMMON MISTAKES & FIXES:**

| Lỗi | Nguyên Nhân | Cách Sửa |
|-----|-----------|---------|
| Biểu đồ không update | Quên gọi `updateAllCharts()` | Gọi đó sau khi `addTransaction()` |
| Dữ liệu mất sau refresh | Quên gọi `saveData()` | Lúc `addTransaction/deleteTransaction` tự gọi |
| Ảnh không upload được | CORS issue hoặc canvas error | Kiểm tra console, test trên localhost |
| API call hang | Quên `await` | Tất cả `fetch` phải `await` |
| Memory leak (Chrome DevTools) | Chart instance không destroy | Gọi `chart.destroy()` trước vẽ lại |
| ES6 module error | Chạy từ file:// thay HTTP | Dùng `python -m http.server 8000` |

---

### 🔍 **DEBUGGING TIPS:**

```javascript
// 1. Log state
console.log('Current appState:', appState)

// 2. Log transactions
console.log('Transactions:', appState.transactions)

// 3. Check localStorage
console.log(JSON.parse(localStorage.getItem('expenseData')))

// 4. Test API
fetch('https://openrouter.ai/api/v1/models', {
  headers: { Authorization: `Bearer ${key}` }
}).then(r => r.json()).then(console.log)

// 5. Test AI prompt
// Copy SYSTEM_PROMPT, paste vào Claude/GPT4, test locally

// 6. Check chart rendering
console.log('Chart instances:', charts)

// 7. Test image compression
console.log('Uploaded images:', appState.uploadedImages)
```

---

## 🛠️ **REFACTORING