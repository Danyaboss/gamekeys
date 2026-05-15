const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /api/orders - создать заказ
router.post('/', async (req, res) => {
    const client = await pool.connect();
    try {
        const { customer_name, customer_email, cart_items, total } = req.body;
        
        await client.query('BEGIN');
        
        // Создаём заказ
        const orderResult = await client.query(
            `INSERT INTO orders (customer_name, customer_email, total) 
             VALUES ($1, $2, $3) RETURNING id`,
            [customer_name, customer_email, total]
        );
        const orderId = orderResult.rows[0].id;
        
        // Добавляем товары в заказ
        for (const item of cart_items) {
            await client.query(
                `INSERT INTO order_items (order_id, game_name, price, quantity) 
                 VALUES ($1, $2, $3, $4)`,
                [orderId, item.name, item.price, item.quantity]
            );
        }
        
        await client.query('COMMIT');
        res.json({ order_id: orderId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Ошибка создания заказа' });
    } finally {
        client.release();
    }
});

// GET /api/orders - получить все заказы
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT o.*, 
                    COUNT(oi.id) as items_count,
                    COALESCE(SUM(oi.price * oi.quantity), 0) as total_sum
             FROM orders o
             LEFT JOIN order_items oi ON o.id = oi.order_id
             GROUP BY o.id
             ORDER BY o.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения заказов' });
    }
});

// GET /api/orders/:id - получить заказ по ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Информация о заказе
        const orderResult = await pool.query(
            'SELECT * FROM orders WHERE id = $1',
            [id]
        );
        
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }
        
        // Товары в заказе
        const itemsResult = await pool.query(
            'SELECT * FROM order_items WHERE order_id = $1',
            [id]
        );
        
        // Ключи из заказа
        const keysResult = await pool.query(
            'SELECT * FROM keys WHERE order_id = $1',
            [id]
        );
        
        res.json({
            order: orderResult.rows[0],
            items: itemsResult.rows,
            keys: keysResult.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения заказа' });
    }
});

module.exports = router;