const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/keys/available/:gameId - получить свободный ключ
router.get('/available/:gameId', async (req, res) => {
    try {
        const { gameId } = req.params;
        const result = await pool.query(
            `SELECT * FROM keys 
             WHERE game_id = $1 AND is_used = FALSE 
             LIMIT 1`,
            [gameId]
        );
        res.json(result.rows[0] || null);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения ключа' });
    }
});

// POST /api/keys - добавить ключи
router.post('/', async (req, res) => {
    try {
        const { game_id, keys } = req.body;
        let added = 0;
        
        for (const key_code of keys) {
            try {
                await pool.query(
                    `INSERT INTO keys (game_id, key_code) VALUES ($1, $2)`,
                    [game_id, key_code.trim()]
                );
                added++;
            } catch (err) {
                // Ключ уже существует
            }
        }
        res.json({ added });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка добавления ключей' });
    }
});

// PUT /api/keys/use - отметить ключ как использованный
router.put('/use', async (req, res) => {
    try {
        const { key_code, order_id, customer_email } = req.body;
        await pool.query(
            `UPDATE keys 
             SET is_used = TRUE, order_id = $1, customer_email = $2, used_at = NOW()
             WHERE key_code = $3`,
            [order_id, customer_email, key_code]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка обновления ключа' });
    }
});

// GET /api/keys/check/:gameId - проверить наличие ключей
router.get('/check/:gameId', async (req, res) => {
    try {
        const { gameId } = req.params;
        const result = await pool.query(
            `SELECT COUNT(*) as count FROM keys 
             WHERE game_id = $1 AND is_used = FALSE`,
            [gameId]
        );
        res.json({ available: parseInt(result.rows[0].count) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка проверки ключей' });
    }
});

module.exports = router;