# 📊 Hướng dẫn kết nối Google Sheets

## Bước 1: Tạo Google Apps Script

1. Mở Google Sheets của bạn: https://docs.google.com/spreadsheets/d/1AXiVSB_wME-a9RmrtS0nTpmhJmI1u0XVJa3nfqXeOAY/edit

2. Click vào **Extensions** (Tiện ích mở rộng) → **Apps Script**

3. Xóa code mẫu và dán đoạn code sau:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Tạo header nếu sheet trống
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Mã ĐH',
        'Thời gian',
        'Tên khách hàng',
        'Số điện thoại',
        'Địa chỉ',
        'Hình thức',
        'Món ăn',
        'Tổng tiền',
        'Ghi chú'
      ]);
    }
    
    // Format thời gian
    var date = new Date(data.timestamp);
    var formattedDate = Utilities.formatDate(date, "GMT+7", "dd/MM/yyyy HH:mm:ss");
    
    // Format món ăn
    var items = data.items.map(function(item) {
      return item.name + ' x' + item.quantity + ' (' + item.price.toLocaleString() + '₫)';
    }).join(', ');
    
    // Hình thức giao hàng
    var deliveryType = data.deliveryType === 'home' ? 'Giao tận nơi' : 'Nhận tại shop';
    
    // Thêm dòng mới
    var orderNumber = '#' + String(sheet.getLastRow()).padStart(4, '0');
    sheet.appendRow([
      orderNumber,
      formattedDate,
      data.name,
      data.phone,
      data.address,
      deliveryType,
      items,
      data.total.toLocaleString() + '₫',
      data.note || ''
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'success',
      'message': 'Đơn hàng đã được lưu vào Google Sheets'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **Save** (💾) và đặt tên project: "Food Order API"

## Bước 2: Deploy Web App

1. Click **Deploy** → **New deployment**

2. Click biểu tượng ⚙️ bên cạnh "Select type" → Chọn **Web app**

3. Điền thông tin:
   - **Description**: Food Order Webhook
   - **Execute as**: Me
   - **Who has access**: Anyone

4. Click **Deploy**

5. Click **Authorize access** → Chọn tài khoản Google của bạn

6. Click **Advanced** → **Go to [Project name] (unsafe)** → **Allow**

7. **QUAN TRỌNG**: Copy **Web app URL** (dạng: https://script.google.com/macros/s/AKfycby.../exec)

## Bước 3: Cập nhật code

1. Mở file `script.js`

2. Tìm dòng:
```javascript
const GOOGLE_SCRIPT_URL = 'YOUR_SCRIPT_URL_HERE';
```

3. Thay `YOUR_SCRIPT_URL_HERE` bằng URL bạn vừa copy ở bước 2.7

4. Lưu file và test!

## ✅ Kiểm tra

- Đặt một đơn hàng thử nghiệm
- Kiểm tra Google Sheets xem có dữ liệu mới không
- Nếu có lỗi, kiểm tra Console (F12) trong trình duyệt

## 🔧 Troubleshooting

**Lỗi CORS**: Đảm bảo bạn đã deploy đúng và chọn "Anyone" có thể truy cập

**Không có dữ liệu**: Kiểm tra URL đã đúng chưa, kiểm tra Console log

**Lỗi Authorization**: Chạy lại bước Deploy và authorize lại
