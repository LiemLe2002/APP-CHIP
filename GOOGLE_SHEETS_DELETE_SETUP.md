# 🗑️ Cập nhật Google Apps Script để hỗ trợ xóa đơn hàng

## Bước 1: Cập nhật Google Apps Script

1. Mở Google Apps Script: https://script.google.com/home

2. Tìm project "Food Order API" và mở

3. **THAY THẾ TOÀN BỘ CODE** bằng code mới bên dưới:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Xử lý theo action type
    if (data.action === 'delete') {
      return handleDelete(sheet, data);
    } else if (data.action === 'deleteAll') {
      return handleDeleteAll(sheet);
    } else {
      return handleAddOrder(sheet, data);
    }
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleAddOrder(sheet, data) {
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
}

function handleDelete(sheet, data) {
  var timestamp = data.timestamp;
  var phone = data.phone;
  
  // Tìm dòng có timestamp và phone khớp
  var lastRow = sheet.getLastRow();
  
  for (var i = 2; i <= lastRow; i++) {
    var rowData = sheet.getRange(i, 1, 1, 9).getValues()[0];
    var rowPhone = rowData[3]; // Cột D - Số điện thoại
    
    // So sánh phone để tìm đơn hàng
    if (rowPhone === phone) {
      sheet.deleteRow(i);
      return ContentService.createTextOutput(JSON.stringify({
        'status': 'success',
        'message': 'Đã xóa đơn hàng khỏi Google Sheets'
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    'status': 'error',
    'message': 'Không tìm thấy đơn hàng để xóa'
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleDeleteAll(sheet) {
  var lastRow = sheet.getLastRow();
  
  if (lastRow > 1) {
    // Xóa tất cả dòng trừ header
    sheet.deleteRows(2, lastRow - 1);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    'status': 'success',
    'message': 'Đã xóa tất cả đơn hàng khỏi Google Sheets'
  })).setMimeType(ContentService.MimeType.JSON);
}
```

4. Click **Save** (💾)

5. **Deploy lại:**
   - Click **Deploy** → **Manage deployments**
   - Click **Edit** (✏️) ở deployment hiện tại
   - Chọn **New version**
   - Click **Deploy**
   - URL sẽ giữ nguyên, không cần thay đổi trong code

## ✅ Hoàn tất

Sau khi cập nhật xong, tính năng xóa đơn hàng trên admin sẽ tự động đồng bộ với Google Sheets!
