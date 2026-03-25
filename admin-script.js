let orders = [];

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzHiBNWVZmaBjcTFk7i9nJhkBreW7V-Qp9MdkZiH0GcmIuAy85nokmelSsz9HSKsGu9WQ/exec';

async function deleteFromGoogleSheets(orderData) {
    if (GOOGLE_SCRIPT_URL === 'https://script.google.com/macros/s/AKfycbzHiBNWVZmaBjcTFk7i9nJhkBreW7V-Qp9MdkZiH0GcmIuAy85nokmelSsz9HSKsGu9WQ/exec') {
        console.warn('Google Sheets URL chưa được cấu hình');
        return { success: false };
    }
    
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'delete',
                timestamp: orderData.timestamp,
                phone: orderData.phone,
                name: orderData.name
            })
        });
        
        console.log('Đã xóa đơn hàng khỏi Google Sheets');
        return { success: true };
    } catch (error) {
        console.error('Lỗi khi xóa khỏi Google Sheets:', error);
        return { success: false };
    }
}

async function deleteAllFromGoogleSheets() {
    if (GOOGLE_SCRIPT_URL === 'https://script.google.com/macros/s/AKfycbzHiBNWVZmaBjcTFk7i9nJhkBreW7V-Qp9MdkZiH0GcmIuAy85nokmelSsz9HSKsGu9WQ/exec') {
        console.warn('Google Sheets URL chưa được cấu hình');
        return { success: false };
    }
    
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'deleteAll'
            })
        });
        
        console.log('Đã xóa tất cả đơn hàng khỏi Google Sheets');
        return { success: true };
    } catch (error) {
        console.error('Lỗi khi xóa tất cả khỏi Google Sheets:', error);
        return { success: false };
    }
}

async function syncFromGoogleSheets() {
    if (GOOGLE_SCRIPT_URL === 'https://script.google.com/macros/s/AKfycbzHiBNWVZmaBjcTFk7i9nJhkBreW7V-Qp9MdkZiH0GcmIuAy85nokmelSsz9HSKsGu9WQ/exec') {
        showNotification('⚠️ Chưa cấu hình Google Sheets URL');
        return;
    }
    
    try {
        showNotification('🔄 Đang đồng bộ từ Google Sheets...');
        
        const response = await fetch(GOOGLE_SCRIPT_URL);
        const result = await response.json();
        
        if (result.status === 'success' && result.data) {
            orders = result.data;
            localStorage.setItem('foodOrders', JSON.stringify(orders));
            updateStats();
            displayOrders();
            showNotification(`✅ Đã đồng bộ ${orders.length} đơn hàng từ Google Sheets!`);
        } else {
            showNotification('❌ Lỗi: ' + (result.message || 'Không thể tải dữ liệu'));
        }
    } catch (error) {
        console.error('Lỗi khi đồng bộ:', error);
        showNotification('❌ Lỗi khi đồng bộ từ Google Sheets');
    }
}

function loadOrders() {
    const savedOrders = localStorage.getItem('foodOrders');
    orders = savedOrders ? JSON.parse(savedOrders) : [];
    updateStats();
    displayOrders();
}

function updateStats() {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const homeDelivery = orders.filter(order => order.deliveryType === 'home').length;
    const pickupOrders = orders.filter(order => order.deliveryType === 'pickup').length;

    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalRevenue').textContent = formatPrice(totalRevenue) + '₫';
    document.getElementById('homeDelivery').textContent = homeDelivery;
    document.getElementById('pickupOrders').textContent = pickupOrders;
}

function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function displayOrders() {
    const ordersList = document.getElementById('ordersList');
    const searchTerm = document.getElementById('searchOrder').value.toLowerCase();
    const filterDelivery = document.getElementById('filterDelivery').value;
    const sortOrder = document.getElementById('sortOrder').value;

    let filteredOrders = orders.filter(order => {
        const matchSearch = order.name.toLowerCase().includes(searchTerm) ||
                          order.phone.includes(searchTerm) ||
                          order.address.toLowerCase().includes(searchTerm);
        const matchDelivery = filterDelivery === 'all' || order.deliveryType === filterDelivery;
        return matchSearch && matchDelivery;
    });

    switch(sortOrder) {
        case 'newest':
            filteredOrders.sort((a, b) => b.timestamp - a.timestamp);
            break;
        case 'oldest':
            filteredOrders.sort((a, b) => a.timestamp - b.timestamp);
            break;
        case 'highest':
            filteredOrders.sort((a, b) => b.total - a.total);
            break;
        case 'lowest':
            filteredOrders.sort((a, b) => a.total - b.total);
            break;
    }

    if (filteredOrders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <p>Không tìm thấy đơn hàng nào</p>
                <small>Thử thay đổi bộ lọc hoặc tìm kiếm</small>
            </div>
        `;
        return;
    }

    ordersList.innerHTML = filteredOrders.map((order, index) => {
        const deliveryIcon = order.deliveryType === 'home' ? '🏠' : '🏪';
        const deliveryText = order.deliveryType === 'home' ? 'Giao tận nơi' : 'Nhận tại shop';
        
        return `
            <div class="order-card" onclick="showOrderDetail(${orders.indexOf(order)})">
                <div class="order-header">
                    <div class="order-id">
                        <strong>#${String(orders.indexOf(order) + 1).padStart(4, '0')}</strong>
                        <span class="order-date">${formatDate(order.timestamp)}</span>
                    </div>
                    <div class="order-total">${formatPrice(order.total)}₫</div>
                </div>
                <div class="order-customer">
                    <div class="customer-info">
                        <span class="customer-name">👤 ${order.name}</span>
                        <span class="customer-phone">📞 ${order.phone}</span>
                    </div>
                    <div class="delivery-type">
                        ${deliveryIcon} ${deliveryText}
                    </div>
                </div>
                <div class="order-address">
                    📍 ${order.address}
                </div>
                <div class="order-items-preview">
                    ${order.items.slice(0, 2).map(item => 
                        `<span class="item-tag">${item.name} x${item.quantity}</span>`
                    ).join('')}
                    ${order.items.length > 2 ? `<span class="more-items">+${order.items.length - 2} món khác</span>` : ''}
                </div>
                <div class="order-actions">
                    <button class="btn-view" onclick="event.stopPropagation(); showOrderDetail(${orders.indexOf(order)})">Xem chi tiết</button>
                    <button class="btn-delete" onclick="event.stopPropagation(); deleteOrder(${orders.indexOf(order)})">Xóa</button>
                </div>
            </div>
        `;
    }).join('');
}

function showOrderDetail(index) {
    const order = orders[index];
    const deliveryIcon = order.deliveryType === 'home' ? '🏠' : '🏪';
    const deliveryText = order.deliveryType === 'home' ? 'Giao hàng tận nơi' : 'Nhận tại cửa hàng';
    
    const content = `
        <div class="detail-section">
            <h3>Thông tin đơn hàng</h3>
            <div class="detail-row">
                <span class="detail-label">Mã đơn:</span>
                <span class="detail-value">#${String(index + 1).padStart(4, '0')}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Thời gian:</span>
                <span class="detail-value">${formatDate(order.timestamp)}</span>
            </div>
        </div>

        <div class="detail-section">
            <h3>Thông tin khách hàng</h3>
            <div class="detail-row">
                <span class="detail-label">Họ tên:</span>
                <span class="detail-value">${order.name}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Số điện thoại:</span>
                <span class="detail-value">${order.phone}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Địa chỉ:</span>
                <span class="detail-value">${order.address}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Hình thức:</span>
                <span class="detail-value">${deliveryIcon} ${deliveryText}</span>
            </div>
            ${order.note ? `
                <div class="detail-row">
                    <span class="detail-label">Ghi chú:</span>
                    <span class="detail-value">${order.note}</span>
                </div>
            ` : ''}
        </div>

        <div class="detail-section">
            <h3>Chi tiết món ăn</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Món ăn</th>
                        <th>Đơn giá</th>
                        <th>SL</th>
                        <th>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${formatPrice(item.price)}₫</td>
                            <td>${item.quantity}</td>
                            <td>${formatPrice(item.price * item.quantity)}₫</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3"><strong>Tổng cộng:</strong></td>
                        <td><strong>${formatPrice(order.total)}₫</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <div class="detail-actions">
            <button class="btn-print" onclick="printOrder(${index})">🖨️ In đơn hàng</button>
            <button class="btn-delete-detail" onclick="deleteOrder(${index}); closeOrderDetail();">🗑️ Xóa đơn hàng</button>
        </div>
    `;

    document.getElementById('orderDetailContent').innerHTML = content;
    document.getElementById('orderDetailModal').classList.add('active');
}

function closeOrderDetail() {
    document.getElementById('orderDetailModal').classList.remove('active');
}

async function deleteOrder(index) {
    if (confirm('Bạn có chắc muốn xóa đơn hàng này?')) {
        const orderToDelete = orders[index];
        
        await deleteFromGoogleSheets(orderToDelete);
        
        orders.splice(index, 1);
        localStorage.setItem('foodOrders', JSON.stringify(orders));
        loadOrders();
        showNotification('Đã xóa đơn hàng! 🗑️');
    }
}

async function clearAllOrders() {
    if (confirm('Bạn có chắc muốn xóa TẤT CẢ đơn hàng? Hành động này không thể hoàn tác!')) {
        await deleteAllFromGoogleSheets();
        
        orders = [];
        localStorage.removeItem('foodOrders');
        loadOrders();
        showNotification('Đã xóa tất cả đơn hàng! 🗑️');
    }
}

function printOrder(index) {
    const order = orders[index];
    const deliveryText = order.deliveryType === 'home' ? 'Giao hàng tận nơi' : 'Nhận tại cửa hàng';
    
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Đơn hàng #${String(index + 1).padStart(4, '0')}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { text-align: center; }
                .info { margin: 20px 0; }
                .info div { margin: 5px 0; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .total { text-align: right; font-weight: bold; font-size: 18px; }
            </style>
        </head>
        <body>
            <h1>12A SHOP Đồ Ăn Vặt</h1>
            <h2>Đơn hàng #${String(index + 1).padStart(4, '0')}</h2>
            <div class="info">
                <div><strong>Thời gian:</strong> ${formatDate(order.timestamp)}</div>
                <div><strong>Khách hàng:</strong> ${order.name}</div>
                <div><strong>Số điện thoại:</strong> ${order.phone}</div>
                <div><strong>Địa chỉ:</strong> ${order.address}</div>
                <div><strong>Hình thức:</strong> ${deliveryText}</div>
                ${order.note ? `<div><strong>Ghi chú:</strong> ${order.note}</div>` : ''}
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Món ăn</th>
                        <th>Đơn giá</th>
                        <th>Số lượng</th>
                        <th>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${formatPrice(item.price)}₫</td>
                            <td>${item.quantity}</td>
                            <td>${formatPrice(item.price * item.quantity)}₫</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="total">Tổng cộng: ${formatPrice(order.total)}₫</div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 50px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

document.getElementById('searchOrder').addEventListener('input', displayOrders);
document.getElementById('filterDelivery').addEventListener('change', displayOrders);
document.getElementById('sortOrder').addEventListener('change', displayOrders);

document.getElementById('orderDetailModal').addEventListener('click', (e) => {
    if (e.target.id === 'orderDetailModal') {
        closeOrderDetail();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeOrderDetail();
    }
});

loadOrders();
