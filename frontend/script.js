const API_URL = 'http://localhost:5000/api';

const App = {
    games: [],
    cart: {},
    currentPage: 'home',
    
    async init() {
        await this.loadGames();
        this.loadCart();
        this.showPage('home');
        this.updateCartCount();
    },
    
    async loadGames() {
        try {
            const res = await fetch(`${API_URL}/games`);
            this.games = await res.json();
            this.renderHome();
            this.renderCatalog();
        } catch(e) {
            this.showFlash('Ошибка подключения к серверу', 'danger');
        }
    },
    
    loadCart() {
        const saved = localStorage.getItem('cart');
        if (saved) this.cart = JSON.parse(saved);
    },
    
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartCount();
    },
    
    updateCartCount() {
        const count = Object.values(this.cart).reduce((s, i) => s + i.quantity, 0);
        const el = document.getElementById('cartCount');
        if (el) el.textContent = count;
    },
    
    addToCart(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return;
        
        if (this.cart[gameId]) {
            this.cart[gameId].quantity++;
        } else {
            this.cart[gameId] = { id: game.id, name: game.name, price: game.price, quantity: 1 };
        }
        this.saveCart();
        this.showFlash(`${game.name} добавлена`, 'success');
        if (this.currentPage === 'cart') this.renderCart();
    },
    
    updateCartQuantity(gameId, delta) {
        if (this.cart[gameId]) {
            this.cart[gameId].quantity += delta;
            if (this.cart[gameId].quantity <= 0) delete this.cart[gameId];
            this.saveCart();
            this.renderCart();
        }
    },
    
    removeFromCart(gameId) {
        delete this.cart[gameId];
        this.saveCart();
        this.renderCart();
        this.showFlash('Товар удалён', 'info');
    },
    
    showPage(page) {
        this.currentPage = page;
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const activePage = document.getElementById(`${page}Page`);
        if (activePage) activePage.classList.add('active');
        
        if (page === 'cart') this.renderCart();
        if (page === 'checkout') this.renderCheckout();
        if (page === 'admin') this.renderAdmin();
    },
    
    renderHome() {
        const container = document.getElementById('popularGames');
        if (!container) return;
        
        const popular = this.games.slice(0, 3);
        container.innerHTML = popular.map(game => `
            <div class="game-card">
                <h3>${game.name}</h3>
                <p>${game.platform}</p>
                <div class="price">$${game.price}</div>
                <button class="btn" onclick="App.addToCart(${game.id})">В корзину</button>
            </div>
        `).join('');
    },
    
    renderCatalog() {
        const container = document.getElementById('catalogGrid');
        if (!container) return;
        
        container.innerHTML = this.games.map(game => `
            <div class="game-card">
                <h3>${game.name}</h3>
                <p>${game.platform}</p>
                <div class="price">$${game.price}</div>
                <button class="btn" onclick="App.addToCart(${game.id})">В корзину</button>
            </div>
        `).join('');
    },
    
    renderCart() {
        const container = document.getElementById('cartContent');
        const items = Object.values(this.cart);
        
        if (items.length === 0) {
            container.innerHTML = '<div class="empty-cart"><h3>Корзина пуста</h3><button class="btn" onclick="App.showPage(\'catalog\')">В каталог</button></div>';
            return;
        }
        
        const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
        
        container.innerHTML = `
            <table class="cart-table">
                <thead><tr><th>Игра</th><th>Цена</th><th>Кол-во</th><th>Сумма</th><th></th></tr></thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>$${item.price}</td>
                            <td class="cart-quantity">
                                <button class="qty-btn" onclick="App.updateCartQuantity(${item.id}, -1)">-</button>
                                ${item.quantity}
                                <button class="qty-btn" onclick="App.updateCartQuantity(${item.id}, 1)">+</button>
                            </td>
                            <td>$${(item.price * item.quantity).toFixed(2)}</td>
                            <td><button class="remove-btn" onclick="App.removeFromCart(${item.id})">✕</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="cart-total"><span>Итого:</span><span>$${total.toFixed(2)}</span></div>
            <div class="cart-actions">
                <button class="btn" onclick="App.showPage('catalog')">← Назад</button>
                <button class="btn btn-success" onclick="App.showPage('checkout')">Оформить →</button>
            </div>
        `;
    },
    
    renderCheckout() {
        const container = document.getElementById('checkoutContent');
        const items = Object.values(this.cart);
        
        if (items.length === 0) {
            this.showPage('cart');
            return;
        }
        
        const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
        
        container.innerHTML = `
            <div class="checkout-container">
                <div class="checkout-card">
                    <h2>📋 Оформление заказа</h2>
                    <p>Заполните данные для получения ключей</p>
                    
                    <div class="form-group">
                        <label>👤 Ваше имя</label>
                        <input type="text" id="customerName" placeholder="Иван Петров">
                    </div>
                    
                    <div class="form-group">
                        <label>📧 Email</label>
                        <input type="email" id="customerEmail" placeholder="ivan@mail.ru">
                    </div>
                    
                    <div class="order-summary">
                        ${items.map(item => `
                            <div class="order-item">
                                <span>${item.name} × ${item.quantity}</span>
                                <span>$${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                        <div class="order-total">
                            <span>Итого:</span>
                            <span>$${total.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>💳 Номер карты</label>
                        <input type="text" id="cardNumber" placeholder="4242 4242 4242 4242" value="4242 4242 4242 4242">
                    </div>
                    
                    <div style="display: flex; gap: 15px;">
                        <div class="form-group" style="flex:1">
                            <label>📅 Срок</label>
                            <input type="text" id="cardExpiry" placeholder="12/28" value="12/28">
                        </div>
                        <div class="form-group" style="flex:1">
                            <label>🔒 CVV</label>
                            <input type="password" id="cardCvv" placeholder="123" value="123">
                        </div>
                    </div>
                    
                    <div class="test-card-info">
                        🔧 <strong>Тестовая карта:</strong> <code>4242 4242 4242 4242</code> | <code>12/28</code> | <code>123</code>
                    </div>
                    
                    <button class="btn btn-success pay-btn" onclick="App.processOrder()" id="payBtn">
                        💳 Оплатить $${total.toFixed(2)}
                    </button>
                </div>
            </div>
        `;
    },
    
    async processOrder() {
        const customerName = document.getElementById('customerName').value;
        const customerEmail = document.getElementById('customerEmail').value;
        const cardNumber = document.getElementById('cardNumber').value;
        const cardExpiry = document.getElementById('cardExpiry').value;
        const cardCvv = document.getElementById('cardCvv').value;
        
        if (!customerName || !customerEmail) {
            this.showFlash('Заполните имя и email', 'danger');
            return;
        }
        
        const cleanCard = cardNumber.replace(/\s/g, '');
        if (cleanCard !== '4242424242424242' || cardExpiry !== '12/28' || cardCvv !== '123') {
            this.showFlash('Неверные данные карты. Используйте тестовые данные', 'danger');
            return;
        }
        
        const payBtn = document.getElementById('payBtn');
        const originalText = payBtn.innerHTML;
        payBtn.disabled = true;
        payBtn.innerHTML = '<span class="loading-spinner"></span> Обработка...';
        
        try {
            const items = Object.values(this.cart);
            const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
            
            const orderRes = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_name: customerName,
                    customer_email: customerEmail,
                    cart_items: items,
                    total: total
                })
            });
            
            const orderResult = await orderRes.json();
            
            const keysOutput = [];
            for (const item of items) {
                for (let i = 0; i < item.quantity; i++) {
                    const keyRes = await fetch(`${API_URL}/keys/available/${item.id}`);
                    const key = await keyRes.json();
                    if (key) {
                        await fetch(`${API_URL}/keys/use`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                key_code: key.key_code,
                                order_id: orderResult.order_id,
                                customer_email: customerEmail
                            })
                        });
                        keysOutput.push(`${item.name}: ${key.key_code}`);
                    }
                }
            }
            
            this.cart = {};
            this.saveCart();
            
            const successContainer = document.getElementById('successContent');
            successContainer.innerHTML = `
                <div class="success-page">
                    <div class="success-icon">🎉</div>
                    <h2>Спасибо за покупку, ${customerName}!</h2>
                    <p>Номер заказа: <strong>#${orderResult.order_id}</strong></p>
                    <div class="keys-box">
                        <h4>🔑 Ваши ключи:</h4>
                        ${keysOutput.map(k => `<div class="key-item">${k}</div>`).join('')}
                    </div>
                    <button class="btn" onclick="App.showPage('home')">На главную</button>
                </div>
            `;
            this.showPage('success');
            
        } catch(e) {
            this.showFlash('Ошибка при оплате', 'danger');
            payBtn.disabled = false;
            payBtn.innerHTML = originalText;
        }
    },
    
    async renderAdmin() {
        try {
            const statsRes = await fetch(`${API_URL}/stats`);
            const stats = await statsRes.json();
            
            document.getElementById('adminStats').innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card"><div class="stat-value">${stats.total_games || 0}</div><div class="stat-label">Игр</div></div>
                    <div class="stat-card"><div class="stat-value">${stats.keys_sold || 0}</div><div class="stat-label">Продано</div></div>
                    <div class="stat-card"><div class="stat-value">$${stats.total_revenue || 0}</div><div class="stat-label">Выручка</div></div>
                </div>
            `;
            
            const select = document.getElementById('keyGameId');
            if (select) {
                select.innerHTML = this.games.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
            }
            
            document.getElementById('adminGamesList').innerHTML = `
                <table class="admin-table">
                    <thead><tr><th>Название</th><th>Платформа</th><th>Цена</th><th></th></tr></thead>
                    <tbody>
                        ${this.games.map(g => `
                            <tr>
                                <td>${g.name}</td>
                                <td>${g.platform}</td>
                                <td>$${g.price}</td>
                                <td><button class="btn-danger" style="padding:5px 10px;" onclick="App.deleteGame(${g.id})">🗑</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            
            const ordersRes = await fetch(`${API_URL}/orders`);
            const orders = await ordersRes.json();
            
            document.getElementById('adminOrdersList').innerHTML = `
                <table class="admin-table">
                    <thead><tr><th>ID</th><th>Покупатель</th><th>Сумма</th><th>Дата</th></tr></thead>
                    <tbody>
                        ${orders.map(o => `
                            <tr>
                                <td>${o.id}</td>
                                <td>${o.customer_name}</td>
                                <td>$${o.total}</td>
                                <td>${new Date(o.created_at).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } catch(e) {
            console.error(e);
        }
    },
    
    async addGame() {
        const name = document.getElementById('gameName').value;
        const platform = document.getElementById('gamePlatform').value;
        const price = parseFloat(document.getElementById('gamePrice').value);
        const genre = document.getElementById('gameGenre').value;
        const description = document.getElementById('gameDescription').value;
        
        if (!name || !price) {
            this.showFlash('Заполните название и цену', 'danger');
            return;
        }
        
        const res = await fetch(`${API_URL}/games`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, platform, price, genre, description })
        });
        
        if (res.ok) {
            await this.loadGames();
            this.renderAdmin();
            this.showFlash(`Игра "${name}" добавлена`, 'success');
            document.getElementById('gameName').value = '';
            document.getElementById('gamePrice').value = '';
            document.getElementById('gameGenre').value = '';
            document.getElementById('gameDescription').value = '';
        }
    },
    
    async addKeys() {
        const gameId = parseInt(document.getElementById('keyGameId').value);
        const keysText = document.getElementById('keysInput').value;
        const keysList = keysText.split('\n').filter(k => k.trim());
        
        if (keysList.length === 0) {
            this.showFlash('Введите ключи', 'danger');
            return;
        }
        
        const res = await fetch(`${API_URL}/keys`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ game_id: gameId, keys: keysList })
        });
        
        const result = await res.json();
        this.showFlash(`Добавлено ${result.added} ключей`, 'success');
        document.getElementById('keysInput').value = '';
    },
    
    async deleteGame(gameId) {
        if (confirm('Удалить игру?')) {
            await fetch(`${API_URL}/games/${gameId}`, { method: 'DELETE' });
            await this.loadGames();
            this.renderAdmin();
            this.showFlash('Игра удалена', 'warning');
        }
    },
    
    showFlash(message, type) {
        const container = document.getElementById('flashContainer');
        const flash = document.createElement('div');
        flash.className = `flash ${type}`;
        flash.textContent = message;
        container.appendChild(flash);
        setTimeout(() => {
            flash.style.opacity = '0';
            setTimeout(() => flash.remove(), 300);
        }, 3000);
    }
};

window.App = App;
document.addEventListener('DOMContentLoaded', () => App.init());