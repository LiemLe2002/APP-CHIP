let cart = [];

const foodData = {
    1: { name: 'Lạp Xưởng nướng đá', price: 15000 },
    2: { name: 'Bò nướng lá lốt', price: 7000 },
    3: { name: 'Thịt xiên nướng', price: 6000 },
    4: { name: 'Ram nướng', price: 4000 },
    5: { name: 'Ô Long Sữa', price: 15000 },
    6: { name: 'Hồng trà sữa', price: 15000 },
    7: { name: 'Trà tắc', price: 10000 },
    8: { name: 'Xoài lắc', price: 10000 }
};

function addToCart(foodId) {
    const existingItem = cart.find(item => item.id === foodId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: foodId,
            name: foodData[foodId].name,
            price: foodData[foodId].price,
            quantity: 1
        });
    }
    
    updateCartUI();
    showNotification('Đã thêm vào giỏ hàng! 🎉');
}

function removeFromCart(foodId) {
    const itemIndex = cart.findIndex(item => item.id === foodId);
    
    if (itemIndex !== -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity--;
        } else {
            cart.splice(itemIndex, 1);
        }
    }
    
    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const totalPrice = document.getElementById('totalPrice');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <p>Giỏ hàng của bạn đang trống</p>
            </div>
        `;
        totalPrice.textContent = '0₫';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${formatPrice(item.price)}₫</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="removeFromCart(${item.id})">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="addToCart(${item.id})">+</button>
                </div>
            </div>
        `).join('');
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalPrice.textContent = formatPrice(total) + '₫';
    }
}

function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

document.querySelector('.cart-icon').addEventListener('click', () => {
    document.getElementById('cartModal').classList.add('active');
});

function closeCart() {
    document.getElementById('cartModal').classList.remove('active');
}

document.getElementById('cartModal').addEventListener('click', (e) => {
    if (e.target.id === 'cartModal') {
        closeCart();
    }
});

document.querySelector('.checkout-btn').addEventListener('click', () => {
    if (cart.length === 0) {
        showNotification('Giỏ hàng trống! 🛒');
        return;
    }
    
    showCustomerForm();
});

const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const foodItems = document.querySelectorAll('.food-item');
    
    foodItems.forEach(item => {
        const foodName = item.querySelector('h3').textContent.toLowerCase();
        if (foodName.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeCart();
        closeCustomerForm();
    }
});

function showCustomerForm() {
    const orderSummary = document.getElementById('orderSummary');
    const summaryTotalPrice = document.getElementById('summaryTotalPrice');
    
    orderSummary.innerHTML = cart.map(item => `
        <div class="summary-item">
            <span>${item.name} x ${item.quantity}</span>
            <span>${formatPrice(item.price * item.quantity)}₫</span>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    summaryTotalPrice.textContent = formatPrice(total) + '₫';
    
    closeCart();
    document.getElementById('customerModal').classList.add('active');
}

function closeCustomerForm() {
    document.getElementById('customerModal').classList.remove('active');
    document.getElementById('customerForm').reset();
}

document.getElementById('customerModal').addEventListener('click', (e) => {
    if (e.target.id === 'customerModal') {
        closeCustomerForm();
    }
});

document.getElementById('customerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('customerName').value,
        phone: document.getElementById('customerPhone').value,
        address: document.getElementById('customerAddress').value,
        deliveryType: document.querySelector('input[name="deliveryType"]:checked').value,
        note: document.getElementById('customerNote').value,
        items: cart.map(item => ({...item})),
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        timestamp: Date.now()
    };
    
    const savedOrders = localStorage.getItem('foodOrders');
    const orders = savedOrders ? JSON.parse(savedOrders) : [];
    orders.push(formData);
    localStorage.setItem('foodOrders', JSON.stringify(orders));
    
    const deliveryText = formData.deliveryType === 'home' ? 'Giao hàng tận nơi' : 'Nhận tại cửa hàng';
    
    console.log('Thông tin đơn hàng:', formData);
    
    showNotification(`Đặt hàng thành công! ${deliveryText} 🎉`);
    
    cart = [];
    updateCartUI();
    closeCustomerForm();
    
    setTimeout(() => {
        alert(`✅ ĐẶT HÀNG THÀNH CÔNG!\n\n👤 Khách hàng: ${formData.name}\n📞 SĐT: ${formData.phone}\n📍 Địa chỉ: ${formData.address}\n🚚 Hình thức: ${deliveryText}\n💰 Tổng tiền: ${formatPrice(formData.total)}₫\n\nCảm ơn bạn đã đặt hàng! Chúng tôi sẽ liên hệ sớm nhất.`);
    }, 500);
});

updateCartUI();
