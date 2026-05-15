CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ТАБЛИЦА: games (игры)
-- ============================================
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    genre VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ТАБЛИЦА: orders (заказы)
-- ============================================
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ТАБЛИЦА: order_items (товары в заказе)
-- ============================================
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    game_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ============================================
-- ТАБЛИЦА: keys (ключи активации)
-- ============================================
CREATE TABLE keys (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL,
    key_code VARCHAR(100) NOT NULL UNIQUE,
    is_used BOOLEAN DEFAULT FALSE,
    order_id INTEGER,
    customer_email VARCHAR(100),
    used_at TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- ============================================
-- СОЗДАНИЕ ИНДЕКСОВ
-- ============================================
CREATE INDEX idx_keys_game_id ON keys(game_id);
CREATE INDEX idx_keys_order_id ON keys(order_id);
CREATE INDEX idx_keys_is_used ON keys(is_used);
CREATE INDEX idx_orders_email ON orders(customer_email);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_games_platform ON games(platform);

-- ============================================
-- ЗАПОЛНЕНИЕ ТЕСТОВЫМИ ДАННЫМИ
-- ============================================

-- Пользователи
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@gamekey.com', 'admin123', 'admin'),
('gamer123', 'gamer@mail.ru', 'pass123', 'user'),
('steam_user', 'steam@mail.ru', 'steam123', 'user');

-- Игры
INSERT INTO games (name, platform, price, genre, description) VALUES
('Cyberpunk 2077', 'Steam', 29.99, 'RPG', 'Откройте для себя историю Ви — наёмницы из Найт-Сити'),
('Elden Ring', 'Steam', 49.99, 'Action', 'Новая фэнтезийная RPG от автора Dark Souls'),
('The Witcher 3', 'GOG', 9.99, 'RPG', 'Легендарная RPG о ведьмаке Геральте'),
('Hogwarts Legacy', 'Steam', 39.99, 'Adventure', 'Погрузитесь в мир магии и волшебства'),
('Baldur''s Gate 3', 'Steam', 59.99, 'RPG', 'Эпическая RPG по мотивам Dungeons & Dragons'),
('Stardew Valley', 'Steam', 14.99, 'Simulation', 'Уютный симулятор фермера'),
('Red Dead Redemption 2', 'Steam', 29.99, 'Action', 'Эпическое приключение на Диком Западе'),
('God of War', 'Steam', 39.99, 'Action', 'Северная сага о Кратосе');

-- Заказы
INSERT INTO orders (customer_name, customer_email, total, status) VALUES
('Иван Петров', 'ivan@mail.ru', 79.98, 'completed'),
('Мария Сидорова', 'maria@mail.ru', 49.99, 'completed'),
('Алексей Смирнов', 'alex@mail.ru', 24.98, 'completed');

-- Товары в заказах
INSERT INTO order_items (order_id, game_name, price, quantity) VALUES
(1, 'Cyberpunk 2077', 29.99, 1),
(1, 'The Witcher 3', 9.99, 1),
(2, 'Elden Ring', 49.99, 1),
(3, 'Stardew Valley', 14.99, 1),
(3, 'Hogwarts Legacy', 39.99, 1);

-- Ключи
INSERT INTO keys (game_id, key_code, is_used, order_id, customer_email, used_at) VALUES
(1, 'AAAAA-BBBBB-CCCCC-DDDDD', TRUE, 1, 'ivan@mail.ru', '2026-05-01 10:30:00'),
(1, '11111-22222-33333-44444', FALSE, NULL, NULL, NULL),
(2, 'XXXXX-YYYYY-ZZZZZ-00000', TRUE, 2, 'maria@mail.ru', '2026-05-02 14:20:00'),
(2, 'XXXXX-11111-22222-33333', FALSE, NULL, NULL, NULL),
(3, 'WITCH-ERXXX-YYYYY-GGGGG', TRUE, 1, 'ivan@mail.ru', '2026-05-01 10:30:00'),
(4, 'HOGWR-ARTS-XXXXX-YYYYY', TRUE, 3, 'alex@mail.ru', '2026-05-03 09:15:00'),
(5, 'BALDUR-GATE3-KEY-12345', FALSE, NULL, NULL, NULL),
(6, 'STARDEW-VALLEY-KEY-67890', TRUE, 3, 'alex@mail.ru', '2026-05-03 09:15:00'),
(7, 'RDR2-KEY-98765-43210', FALSE, NULL, NULL, NULL),
(8, 'GOW-KEY-55555-66666', FALSE, NULL, NULL, NULL);

-- Проверка
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'games', COUNT(*) FROM games
UNION ALL
SELECT 'keys', COUNT(*) FROM keys
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items;