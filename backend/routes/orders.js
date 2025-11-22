import express from 'express';
const router = express.Router();
import pool from '../bd.js';

// GET /api/orders - Fetch all orders
router.get('/', async (req, res) => {
    try {
        const query = 'SELECT * FROM ordenes ORDER BY id ASC';
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/orders/:id - Fetch a single order by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT * FROM ordenes WHERE id = $1';
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching order:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/orders - Create a new order
router.post('/', async (req, res) => {
    try {
        const { usuario_id, total, estado } = req.body;
        const query = 'INSERT INTO ordenes (usuario_id, total, estado) VALUES ($1, $2, $3) RETURNING *';
        const result = await pool.query(query, [usuario_id, total, estado]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/orders/:id - Update an order
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { usuario_id, total, estado } = req.body;
        const query = 'UPDATE ordenes SET usuario_id = $1, total = $2, estado = $3 WHERE id = $4 RETURNING *';
        const result = await pool.query(query, [usuario_id, total, estado, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating order:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/orders/:id - Delete an order
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM ordenes WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        console.error('Error deleting order:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
