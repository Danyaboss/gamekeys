const App = {
    // Данные
    games: [],
    keys: [],
    orders: [],
    cart: {},
    
    // Счётчики ID
    nextGameId: 1,
    nextKeyId: 1,
    nextOrderId: 1,
    
    // Фильтры
    currentPlatformFilter: '',
    currentSearchQuery: '',
    
    // Инициализация
    init() {
        this.loadData();
        this.initTestData();
        this.renderPopularGames();
        this.updateCartCount();
    },
    
    // Тестовые данные
    initTestData() {
        if (this.games.length === 0) {
            this.games = [
                { id: 1, name: 'Cyberpunk 2077', platform: 'Steam', price: 29.99, genre: 'RPG', description: 'Откройте для себя историю Ви — наёмницы из Найт-Сити' },
                { id: 2, name: 'Elden Ring', platform: 'Steam', price: 49.99, genre: 'Action', description: 'Новая фэнтезийная RPG от автора Dark Souls' },
                { id: 3, name: 'The Witcher 3', platform: 'GOG', price: 9.99, genre: 'RPG', description: 'Легендарная RPG о ведьмаке Геральте' },
                { id: 4, name: 'Hogwarts Legacy', platform: 'Steam', price: 39.99, genre: 'Adventure', description: 'Погрузитесь в мир магии и волшебства' },
                { id: 5, name: 'Baldur\'s Gate 3', platform: 'Steam', price: 59.99, genre: 'RPG', description: 'Эпическая RPG по мотивам Dungeons & Dragons' },
                { id: 6, name: 'Stardew Valley', platform: 'Steam', price: 14.99, genre: 'Simulation', description: 'Уютный симулятор фермера' }
            ];
            this.nextGameId = 7;
            
            this.keys = [
                { id: 1, game_id: 1, key_code: 'AAAAA-BBBBB-CCCCC-DDDDD', is_used: false, order_id: null, customer_email: null },
                { id: 2, game_id: 1, key_code: '11111-22222-33333-44444', is_used: false, order_id: null, customer_email: null },
                { id: 3, game_id: 2, key_code: 'XXXXX-YYYYY-ZZZZZ-00000', is_used: false, order_id: null, customer_email: null },
                { id: 4, game_id: 3, key_code: 'WITCH-ERXXX-YYYYY-GGGGG', is_used: false, order_id: null, customer_email: null },
                { id: 5, game_id: 4, key_code: 'HOGWR-ARTS-XXXXX-YYYYY', is_used: false, order_id: null, customer_email: null },
                { id: 6, game_id: 5, key_code: 'BALDUR-GATE3-KEY-12345', is_used: false, order_id: null, customer_email: null },
                { id: 7, game_id: 6, key_code: 'STARDEW-VALLEY-KEY-67890', is_used: false, order_id: null, customer_email: null }
            ];
            this.nextKeyId = 8;
            
            this.orders = [];
            this.nextOrderId = 1;
            this.cart = {};
            
            this.saveData();
        }
    },
    
    // LocalStorage
    loadData() {
        const savedGames = localStorage.getItem('games');
        const savedKeys = localStorage.getItem('keys');
        const savedOrders = localStorage.getItem('orders');
        const savedCart = localStorage.getItem('cart');
        const savedIds = localStorage.getItem('ids');
        
        if (savedGames) this.games = JSON.parse(savedGames);
        if (savedKeys) this.keys = JSON.parse(savedKeys);
        if (savedOrders) this.orders = JSON.parse(savedOrders);
        if (savedCart) this.cart = JSON.parse(savedCart);
        if (savedIds) {
            const ids = JSON.parse(savedIds);
            this.nextGameId = ids.nextGameId;
            this.nextKeyId = ids.nextKeyId;
            this.nextOrderId = ids.nextOrderId;
        }
    },
    
    saveData() {
        localStorage.setItem('games', JSON.stringify(this.games));
        localStorage.setItem('keys', JSON.stringify(this.keys));
        localStorage.setItem('orders', JSON.stringify(this.orders));
        localStorage.setItem('cart', JSON.stringify(this.cart));
        localStorage.setItem('ids', JSON.stringify({
            nextGameId: this.nextGameId,
            nextKeyId: this.nextKeyId,
            nextOrderId: this.nextOrderId
        }));
    },
    
    // Уведомления
    showFlash(message, type = 'success') {
        const container = document.getElementById('flashContainer');
        const flash = document.createElement('div');
        flash.className = `flash ${type}`;
        flash.textContent = message;
        container.appendChild(flash);
        setTimeout(() => {
            flash.style.opacity = '0';
            setTimeout(() => flash.remove(), 300);
        }, 3000);
    },
    
    // Корзина
    updateCartCount() {
        const count = Object.values(this.cart).reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cartCount').textContent = count;
    },
    
    addToCart(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return;
        
        if (this.cart[gameId]) {
            this.cart[gameId].quantity++;
        } else {
            this.cart[gameId] = { id: game.id, name: game.name, price: game.price, quantity: 1 };
        }
        this.saveData();
        this.updateCartCount();
        this.showFlash(`${game.name} добавлена в корзину`, 'success');
    },
    
    updateCartQuantity(gameId, delta) {
        if (this.cart[gameId]) {
            this.cart[gameId].quantity += delta;
            if (this.cart[gameId].quantity <= 0) {
                delete this.cart[gameId];
            }
            this.saveData();
            this.updateCartCount();
            this.renderCart();
        }
    },
    
    removeFromCart(gameId) {
        delete this.cart[gameId];
        this.saveData();
        this.updateCartCount();
        this.renderCart();
        this.showFlash('Товар удалён из корзины', 'info');
    },
    
    // Навигация
    showPage(pageName) {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(`${pageName}Page`).classList.add('active');
        
        if (pageName === 'home') this.renderPopularGames();
        if (pageName === 'catalog') this.renderCatalog();
        if (pageName === 'cart') this.renderCart();
        if (pageName === 'checkout') this.renderCheckout();
        if (pageName === 'admin') this.renderAdmin();
    },
    
    // Главная
    renderPopularGames() {
        const popular = this.games.slice(0, 3);
        const container = document.getElementById('popularGames');
        container.innerHTML = popular.map(game => `
            <div class="game-card">
                <h3>${this.escapeHtml(game.name)}</h3>
                <p><span class="platform">${this.escapeHtml(game.platform)}</span> • ${this.escapeHtml(game.genre)}</p>
                <p>${this.escapeHtml(game.description.substring(0, 80))}...</p>
                <div class="price">$${game.price}</div>
                <button class="btn" onclick="App.addToCart(${game.id})">В корзину</button>
            </div>
        `).join('');
    },
    
    // Каталог
    renderCatalog() {
        let filtered = [...this.games];
        if (this.currentPlatformFilter) {
            filtered = filtered.filter(g => g.platform === this.currentPlatformFilter);
        }
        if (this.currentSearchQuery) {
            filtered = filtered.filter(g => g.name.toLowerCase().includes(this.currentSearchQuery.toLowerCase()));
        }
        
        const container = document.getElementById('catalogGrid');
        container.innerHTML = filtered.map(game => `
            <div class="game-card">
                <h3>${this.escapeHtml(game.name)}</h3>
                <p><span class="platform">${this.escapeHtml(game.platform)}</span> • ${this.escapeHtml(game.genre)}</p>
                <p>${this.escapeHtml(game.description.substring(0, 80))}...</p>
                <div class="price">$${game.price}</div>
                <button class="btn" onclick="App.addToCart(${game.id})">В корзину</button>
            </div>
        `).join('');
        
        if (filtered.length === 0) {
            container.innerHTML = '<p style="text-align:center">Игры не найдены</p>';
        }
    },
    
    setPlatformFilter(platform) {
        this.currentPlatformFilter = platform;
        this.renderCatalog();
    },
    
    searchGames() {
        this.currentSearchQuery = document.getElementById('searchInput').value;
        this.renderCatalog();
    },
    
    // Корзина
    renderCart() {
        const container = document.getElementById('cartContent');
        const cartItems = Object.values(this.cart);
        
        if (cartItems.length === 0) {
            container.innerHTML = '<div class="empty-cart"><h3>Корзина пуста</h3><button class="btn" onclick="App.showPage(\'catalog\')">Перейти в каталог</button></div>';
            return;
        }
        
        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        
        container.innerHTML = `
            <table class="cart-table">
                <thead>
                    <tr><th>Игра</th><th>Цена</th><th>Кол-во</th><th>Сумма</th><th></th></tr>
                </thead>
                <tbody>
                    ${cartItems.map(item => `
                        <tr>
                            <td>${this.escapeHtml(item.name)}</td>
                            <td>$${item.price}</td>
                            <td>
                                <button style="background:#ff6b6b; border:none; color:white; width:25px; cursor:pointer;" onclick="App.updateCartQuantity(${item.id}, -1)">−</button>
                                ${item.quantity}
                                <button style="background:#28a745; border:none; color:white; width:25px; cursor:pointer;" onclick="App.updateCartQuantity(${item.id}, 1)">+</button>
                            </td>
                            <td>$${(item.price * item.quantity).toFixed(2)}</td>
                            <td><button class="btn-danger" style="padding:5px 10px;" onclick="App.removeFromCart(${item.id})">✕</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="total">Итого: $${total.toFixed(2)}</div>
            <button class="btn btn-success" onclick="App.showPage('checkout')">Оформить заказ</button>
        `;
    },
    
    // Платёжная система
    validatePayment(cardNumber, expiry, cvv) {
        // Простая валидация для тестовых данных
        const cleanCard = cardNumber.replace(/\s/g, '');
        if (cleanCard === '4242424242424242' && expiry === '12/28' && cvv === '123') {
            return { valid: true, message: 'Оплата прошла успешно!' };
        }
        if (cleanCard.length === 16 && /^\d+$/.test(cleanCard) && 
            /^\d{2}\/\d{2}$/.test(expiry) && /^\d{3}$/.test(cvv)) {
            return { valid: true, message: 'Оплата прошла успешно!' };
        }
        return { valid: false, message: 'Ошибка оплаты. Проверьте данные карты. Тестовая карта: 4242 4242 4242 4242 / 12/28 / 123' };
    },
    
    processPayment() {
        return new Promise((resolve) => {
            const cardNumber = document.getElementById('cardNumber').value;
            const expiry = document.getElementById('cardExpiry').value;
            const cvv = document.getElementById('cardCvv').value;
            
            const result = this.validatePayment(cardNumber, expiry, cvv);
            
            setTimeout(() => {
                resolve(result);
            }, 1000);
        });
    },
    
    async processOrder() {
        const cartItems = Object.values(this.cart);
        const customerName = document.getElementById('customerName').value;
        const customerEmail = document.getElementById('customerEmail').value;
        
        if (!customerName || !customerEmail) {
            this.showFlash('Заполните все поля', 'danger');
            return;
        }
        
        // Проверка ключей
        const availableKeys = [];
        for (const item of cartItems) {
            const gameKeys = this.keys.filter(k => k.game_id === item.id && !k.is_used);
            if (gameKeys.length < item.quantity) {
                this.showFlash(`Извините, ключи для игры "${item.name}" закончились`, 'danger');
                return;
            }
            availableKeys.push(...gameKeys.slice(0, item.quantity));
        }
        
        // Платёжная кнопка блокируется
        const payBtn = document.getElementById('payBtn');
        if (payBtn) {
            payBtn.disabled = true;
            payBtn.textContent = '⏳ Обработка платежа...';
        }
        
        // Имитация оплаты
        const paymentResult = await this.processPayment();
        
        if (payBtn) {
            payBtn.disabled = false;
            payBtn.textContent = '💳 Оплатить';
        }
        
        if (!paymentResult.valid) {
            this.showFlash(paymentResult.message, 'danger');
            return;
        }
        
        this.showFlash(paymentResult.message, 'success');
        
        // Создание заказа
        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const order = {
            id: this.nextOrderId++,
            customer_name: customerName,
            customer_email: customerEmail,
            total: total,
            created_at: new Date().toISOString(),
            items: [...cartItems]
        };
        this.orders.push(order);
        
        // Выдача ключей
        const keysOutput = [];
        let keyIndex = 0;
        for (const item of cartItems) {
            for (let i = 0; i < item.quantity; i++) {
                const key = availableKeys[keyIndex++];
                key.is_used = true;
                key.order_id = order.id;
                key.customer_email = customerEmail;
                keysOutput.push(`${item.name}: ${key.key_code}`);
            }
        }
        
        // Очистка корзины
        this.cart = {};
        this.saveData();
        this.updateCartCount();
        
        // Показ успеха
        this.showSuccess(order.id, keysOutput, customerName, customerEmail);
    },
    
    // Оформление заказа с платёжной формой
    renderCheckout() {
        const cartItems = Object.values(this.cart);
        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        
        const container = document.getElementById('checkoutContent');
        container.innerHTML = `
            <form id="checkoutForm">
                <div class="form-group">
                    <label>Ваше имя</label>
                    <input type="text" id="customerName" required>
                </div>
                <div class="form-group">
                    <label>Email (на него придёт ключ)</label>
                    <input type="email" id="customerEmail" required>
                </div>
                
                <h3>Состав заказа</h3>
                <table class="cart-table">
                    <thead><tr><th>Игра</th><th>Цена</th><th>Кол-во</th><th>Сумма</th></tr></thead>
                    <tbody>
                        ${cartItems.map(item => `
                            <tr>
                                <td>${this.escapeHtml(item.name)}</td>
                                <td>$${item.price}</td>
                                <td>${item.quantity}</td>
                                <td>$${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="total">Итого: $${total.toFixed(2)}</div>
                
                <div class="payment-form">
                    <h4>💳 Данные карты для оплаты</h4>
                    <div class="card-icons">
                        💳 💰 🏦
                    </div>
                    <div class="form-group">
                        <label>Номер карты</label>
                        <input type="text" id="cardNumber" placeholder="4242 4242 4242 4242" maxlength="19">
                    </div>
                    <div class="payment-row">
                        <div class="form-group">
                            <label>Срок (ММ/ГГ)</label>
                            <input type="text" id="cardExpiry" placeholder="12/28" maxlength="5">
                        </div>
                        <div class="form-group">
                            <label>CVV/CVC</label>
                            <input type="password" id="cardCvv" placeholder="123" maxlength="3">
                        </div>
                    </div>
                    <div class="test-card-info">
                        🔧 Тестовая карта: 4242 4242 4242 4242 | 12/28 | 123
                    </div>
                </div>
                
                <button type="submit" class="btn btn-success" id="payBtn">💳 Оплатить</button>
            </form>
        `;
        
        document.getElementById('checkoutForm').onsubmit = (e) => {
            e.preventDefault();
            this.processOrder();
        };
    },
    
    showSuccess(orderId, keys, customerName, customerEmail) {
        const container = document.getElementById('successContent');
        container.innerHTML = `
            <div class="success-icon">🎮✨</div>
            <h2>Спасибо за покупку, ${this.escapeHtml(customerName)}!</h2>
            <p>Номер заказа: <strong>#${orderId}</strong></p>
            <p>Ключи отправлены на email: <strong>${this.escapeHtml(customerEmail)}</strong></p>
            <div class="keys-box">
                <h4>🔑 Ваши ключи:</h4>
                ${keys.map(k => `<div class="key-item">${this.escapeHtml(k)}</div>`).join('')}
            </div>
        `;
        this.showPage('success');
    },
    
    // Админ панель
    renderAdmin() {
        const stats = {
            total_games: this.games.length,
            total_keys: this.keys.length,
            total_keys_used: this.keys.filter(k => k.is_used).length,
            total_orders: this.orders.length,
            total_revenue: this.orders.reduce((sum, o) => sum + o.total, 0)
        };
        
        document.getElementById('adminStats').innerHTML = `
            <p>📦 Игр в каталоге: ${stats.total_games}</p>
            <p>🔑 Всего ключей: ${stats.total_keys}</p>
            <p>✅ Использовано ключей: ${stats.total_keys_used}</p>
            <p>📋 Всего заказов: ${stats.total_orders}</p>
            <p>💰 Выручка: $${stats.total_revenue.toFixed(2)}</p>
        `;
        
        const keyGameSelect = document.getElementById('keyGameId');
        keyGameSelect.innerHTML = this.games.map(g => `<option value="${g.id}">${this.escapeHtml(g.name)}</option>`).join('');
        
        document.getElementById('adminGamesList').innerHTML = `
            <table class="cart-table">
                <thead><tr><th>ID</th><th>Название</th><th>Платформа</th><th>Цена</th><th></th></tr></thead>
                <tbody>
                    ${this.games.map(g => `
                        <tr>
                            <td>${g.id}</td><td>${this.escapeHtml(g.name)}</td><td>${this.escapeHtml(g.platform)}</td>
                            <td>$${g.price}</td>
                            <td><button class="btn-danger" style="padding:5px 10px;" onclick="App.deleteGame(${g.id})">🗑</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('adminOrdersList').innerHTML = `
            <table class="cart-table">
                <thead><tr><th>ID</th><th>Покупатель</th><th>Email</th><th>Сумма</th><th>Дата</th></tr></thead>
                <tbody>
                    ${this.orders.map(o => `
                        <tr>
                            <td>${o.id}</td><td>${this.escapeHtml(o.customer_name)}</td>
                            <td>${this.escapeHtml(o.customer_email)}</td>
                            <td>$${o.total.toFixed(2)}</td>
                            <td>${new Date(o.created_at).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },
    
    addGame() {
        const name = document.getElementById('gameName').value;
        const platform = document.getElementById('gamePlatform').value;
        const price = parseFloat(document.getElementById('gamePrice').value);
        const genre = document.getElementById('gameGenre').value;
        const description = document.getElementById('gameDescription').value;
        
        if (!name || !price) {
            this.showFlash('Заполните название и цену', 'danger');
            return;
        }
        
        const newGame = {
            id: this.nextGameId++,
            name, platform, price, genre, description
        };
        this.games.push(newGame);
        this.saveData();
        this.renderAdmin();
        this.showFlash(`Игра "${name}" добавлена`, 'success');
        
        document.getElementById('gameName').value = '';
        document.getElementById('gamePrice').value = '';
        document.getElementById('gameGenre').value = '';
        document.getElementById('gameDescription').value = '';
    },
    
    addKeys() {
        const gameId = parseInt(document.getElementById('keyGameId').value);
        const keysText = document.getElementById('keysInput').value;
        const keysList = keysText.split('\n').filter(k => k.trim());
        
        let added = 0;
        for (const keyCode of keysList) {
            if (!this.keys.some(k => k.key_code === keyCode.trim())) {
                this.keys.push({
                    id: this.nextKeyId++,
                    game_id: gameId,
                    key_code: keyCode.trim(),
                    is_used: false,
                    order_id: null,
                    customer_email: null
                });
                added++;
            }
        }
        this.saveData();
        this.showFlash(`Добавлено ${added} ключей`, 'success');
        document.getElementById('keysInput').value = '';
        this.renderAdmin();
    },
    
    deleteGame(gameId) {
        if (confirm('Удалить игру? Все ключи также будут удалены.')) {
            this.games = this.games.filter(g => g.id !== gameId);
            this.keys = this.keys.filter(k => k.game_id !== gameId);
            this.saveData();
            this.renderAdmin();
            this.showFlash('Игра удалена', 'warning');
        }
    },
    
    // Защита от XSS
    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
};

// Запуск приложения
App.init();