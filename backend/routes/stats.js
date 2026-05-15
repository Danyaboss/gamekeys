const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/stats - общая статистика
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM games) as total_games,
                (SELECT COUNT(*) FROM orders) as total_orders,
                (SELECT COUNT(*) FROM keys) as total_keys,
                (SELECT COUNT(*) FROM keys WHERE is_used = TRUE) as keys_sold,
                (SELECT COALESCE(SUM(total), 0) FROM orders) as total_revenue
        `);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения статистики' });
    }
});

// GET /api/stats/sales-by-game - продажи по играм
router.get('/sales-by-game', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                g.name,
                g.platform,
                COUNT(k.id) as sold_count,
                SUM(g.price) as revenue
            FROM games g
            JOIN keys k ON g.id = k.game_id
            WHERE k.is_used = TRUE
            GROUP BY g.id
            ORDER BY sold_count DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения статистики' });
    }
});

// GET /api/stats/sales-by-month - продажи по месяцам
router.get('/sales-by-month', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                DATE_TRUNC('month', created_at) as month,
                COUNT(*) as orders_count,
                SUM(total) as revenue
            FROM orders
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY month DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения статистики' });
    }
});

module.exports = router;