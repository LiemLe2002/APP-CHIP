# 🔄 Hướng dẫn đồng bộ dữ liệu từ Google Sheets về Admin

## Bước 1: Cập nhật Google Apps Script

Bạn cần cập nhật code trong Google Apps Script để hỗ trợ lấy dữ liệu về.

1. Mở Google Apps Script: https://script.google.com/home

2. Tìm project "Food Order API" và mở

3. **THAY THẾ TOÀN BỘ CODE** bằng code mới:

```javascript
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    
    // Bỏ qua header row
    var orders = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      
      // Parse items từ string
      var itemsString = row[6]; // Cột G - Món ăn
      var items = parseItems(itemsString);
      
      // Parse total từ string (bỏ ₫ và dấu phẩy)
      var totalString = row[7]; // Cột H - Tổng tiền
      var total = parseInt(totalString.toString().replace(/[₫,]/g, ''));
      
      // Parse delivery type
      var deliveryType = row[5] === 'Giao tận nơi' ? 'home' : 'pickup';
      
      // Parse timestamp từ date string
      var dateString = row[1]; // Cột B - Thời gian
      var timestamp = parseDate(dateString);
      
      orders.push({
        name: row[2],           // Cột C - Tên
        phone: row[3],          // Cột D - SĐT
        address: row[4],        // Cột E - Địa chỉ
        deliveryType: deliveryType,
        note: row[8] || '',     // Cột I - Ghi chú
        items: items,
        total: total,
        timestamp: timestamp
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: orders
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function parseItems(itemsString) {
  if (!itemsString) return [];
  
  var items = [];
  var itemParts = itemsString.split(', ');
  
  for (var i = 0; i < itemParts.length; i++) {
    var part = itemParts[i];
    // Format: "Tên món x2 (15,000₫)"
    var match = part.match(/(.+?) x(\d+) \((.+?)₫\)/);
    
    if (match) {
      var name = match[1].trim();
      var quantity = parseInt(match[2]);
      var price = parseInt(match[3].replace(/,/g, ''));
      
      items.push({
        id: i + 1,
        name: name,
        price: price,
        quantity: quantity
      });
    }
  }
  
  return items;
}

function parseDate(dateString) {
  // Format: "dd/MM/yyyy HH:mm:ss"
  if (!dateString) return Date.now();
  
  try {
    var parts = dateString.toString().split(' ');
    var dateParts = parts[0].split('/');
    var timeParts = parts[1].split(':');
    
    var day = parseInt(dateParts[0]);
    var month = parseInt(dateParts[1]) - 1;
    var year = parseInt(dateParts[2]);
    var hour = parseInt(timeParts[0]);
    var minute = parseInt(timeParts[1]);
    var second = parseInt(timeParts[2]);
    
    var date = new Date(year, month, day, hour, minute, second);
    return date.getTime();
  } catch (e) {
    return Date.now();
  }
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
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
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Mã ĐH', 'Thời gian', 'Tên khách hàng', 'Số điện thoại', 'Địa chỉ', 'Hình thức', 'Món ăn', 'Tổng tiền', 'Ghi chú']);
  }
  
  var date = new Date(data.timestamp);
  var formattedDate = Utilities.formatDate(date, "GMT+7", "dd/MM/yyyy HH:mm:ss");
  var items = data.items.map(function(item) {
    return item.name + ' x' + item.quantity + ' (' + item.price.toLocaleString() + '₫)';
  }).join(', ');
  var deliveryType = data.deliveryType === 'home' ? 'Giao tận nơi' : 'Nhận tại shop';
  var orderNumber = '#' + String(sheet.getLastRow()).padStart(4, '0');
  
  sheet.appendRow([orderNumber, formattedDate, data.name, data.phone, data.address, deliveryType, items, data.total.toLocaleString() + '₫', data.note || '']);
  
  return ContentService.createTextOutput(JSON.stringify({'status': 'success'})).setMimeType(ContentService.MimeType.JSON);
}

function handleDelete(sheet, data) {
  var phone = data.phone;
  var lastRow = sheet.getLastRow();
  
  for (var i = 2; i <= lastRow; i++) {
    var rowData = sheet.getRange(i, 1, 1, 9).getValues()[0];
    var rowPhone = rowData[3];
    
    if (rowPhone === phone) {
      sheet.deleteRow(i);
      return ContentService.createTextOutput(JSON.stringify({'status': 'success'})).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({'status': 'error'})).setMimeType(ContentService.MimeType.JSON);
}

function handleDeleteAll(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  return ContentService.createTextOutput(JSON.stringify({'status': 'success'})).setMimeType(ContentService.MimeType.JSON);
}
```

4. **Click Save** (💾)

5. **Deploy lại:**
   - Click **Deploy** → **Manage deployments**
   - Click **Edit** (✏️)
   - Chọn **New version**
   - Click **Deploy**
   - URL giữ nguyên

## ✅ Hoàn tất

Sau khi cập nhật, admin sẽ có nút "Đồng bộ từ Google Sheets" để tải dữ liệu về!
