const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Раздача статических файлов из папки frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/games', require('./routes/games'));
app.use('/api/keys', require('./routes/keys'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/stats', require('./routes/stats'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Все остальные запросы отдаём index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📊 API:`);
    console.log(`   - GET  /api/games`);
    console.log(`   - POST /api/games`);
    console.log(`   - GET  /api/orders`);
    console.log(`   - POST /api/orders`);
    console.log(`   - GET  /api/stats`);
    console.log(`🌐 Сайт доступен: http://localhost:${PORT}`);
});