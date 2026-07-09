import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../bd.js';

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || 'dev_secret';

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: 'Token missing' });
    }

    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = decoded;
        next();
    });
}

router.use(authenticateToken);

// GET /api/orders
router.get('/', async (req, res) => {
    try {
        const ordersResult = await pool.query(
            'SELECT * FROM ordenes WHERE usuario_id = $1 ORDER BY id ASC',
            [req.user.id]
        );

        const orders = ordersResult.rows;

        for (const order of orders) {
            const itemsResult = await pool.query(
                'SELECT * FROM orden_items WHERE orden_id = $1',
                [order.id]
            );
            order.items = itemsResult.rows;
        }

        return res.json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const orderResult = await pool.query(
            'SELECT * FROM ordenes WHERE id = $1',
            [id]
        );

        const order = orderResult.rows[0];

        if (!order || order.usuario_id !== req.user.id) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const itemsResult = await pool.query(
            'SELECT * FROM orden_items WHERE orden_id = $1',
            [id]
        );

        order.items = itemsResult.rows;

        return res.json(order);
    } catch (err) {
        console.error('Error fetching order:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/orders
router.post('/', async (req, res) => {
    try {
        const { items, estado } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Items are required' });
        }

        const total = items.reduce((sum, item) => sum + item.cantidad * item.precio, 0);

        const orderInsert = await pool.query(
            'INSERT INTO ordenes (usuario_id, total, estado) VALUES ($1, $2, $3) RETURNING *',
            [req.user.id, total, estado || 'pendiente']
        );

        const newOrder = orderInsert.rows[0];

        for (const item of items) {
            await pool.query(
                'INSERT INTO orden_items (orden_id, producto_id, cantidad, precio) VALUES ($1, $2, $3, $4)',
                [newOrder.id, item.producto_id, item.cantidad, item.precio]
            );
        }

        const orderItems = await pool.query(
            'SELECT * FROM orden_items WHERE orden_id = $1',
            [newOrder.id]
        );

        newOrder.items = orderItems.rows;

        return res.status(201).json(newOrder);
    } catch (err) {
        console.error('Error creating order:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/orders/:id
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { total, estado } = req.body;

        const orderResult = await pool.query(
            'SELECT * FROM ordenes WHERE id = $1',
            [id]
        );

        const order = orderResult.rows[0];

        if (!order || order.usuario_id !== req.user.id) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const updatedResult = await pool.query(
            'UPDATE ordenes SET total = $1, estado = $2 WHERE id = $3 RETURNING *',
            [total, estado, id]
        );

        return res.json(updatedResult.rows[0]);
    } catch (err) {
        console.error('Error updating order:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/orders/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const orderResult = await pool.query(
            'SELECT * FROM ordenes WHERE id = $1',
            [id]
        );

        const order = orderResult.rows[0];

        if (!order || order.usuario_id !== req.user.id) {
            return res.status(404).json({ error: 'Order not found' });
        }

        await pool.query('DELETE FROM orden_items WHERE orden_id = $1', [id]);
        const result = await pool.query('DELETE FROM ordenes WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        return res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        console.error('Error deleting order:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

