const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/games - получить все игры
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM games ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения игр' });
    }
});

// GET /api/games/:id - получить игру по ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM games WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Игра не найдена' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения игры' });
    }
});

// POST /api/games - добавить игру
router.post('/', async (req, res) => {
    try {
        const { name, platform, price, genre, description } = req.body;
        const result = await pool.query(
            `INSERT INTO games (name, platform, price, genre, description) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, platform, price, genre, description]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка добавления игры' });
    }
});

// PUT /api/games/:id - обновить игру
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, platform, price, genre, description } = req.body;
        const result = await pool.query(
            `UPDATE games 
             SET name = $1, platform = $2, price = $3, genre = $4, description = $5
             WHERE id = $6 RETURNING *`,
            [name, platform, price, genre, description, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Игра не найдена' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка обновления игры' });
    }
});

// DELETE /api/games/:id - удалить игру
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM games WHERE id = $1', [id]);
        res.json({ message: 'Игра удалена' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка удаления игры' });
    }
});

module.exports = router;