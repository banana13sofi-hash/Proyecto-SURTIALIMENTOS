import express from 'express';
import jwt from 'jsonwebtoken';
import dbPromise from '../bd.js';

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

// GET /api/orders - Fetch orders for authenticated user
router.get('/', async (req, res) => {
    try {
        const db = await dbPromise;
        const orders = await db.all('SELECT * FROM ordenes WHERE usuario_id = ? ORDER BY id ASC', [req.user.id]);

        // Fetch items for each order
        for (const order of orders) {
            const items = await db.all('SELECT * FROM orden_items WHERE orden_id = ?', [order.id]);
            order.items = items;
        }

        res.json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/orders/:id - Fetch a single order by ID for the authenticated user
router.get('/:id', async (req, res) => {
    try {
        const db = await dbPromise;
        const { id } = req.params;
        const order = await db.get('SELECT * FROM ordenes WHERE id = ?', [id]);

        if (!order || order.usuario_id !== req.user.id) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Fetch items
        const items = await db.all('SELECT * FROM orden_items WHERE orden_id = ?', [id]);
        order.items = items;

        res.json(order);
    } catch (err) {
        console.error('Error fetching order:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/orders - Create a new order for the authenticated user
router.post('/', async (req, res) => {
    try {
        const db = await dbPromise;
        const { items, estado } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Items are required' });
        }

        // Calculate total from items
        const total = items.reduce((sum, item) => sum + (item.cantidad * item.precio), 0);

        // Insert order
        const result = await db.run(
            'INSERT INTO ordenes (usuario_id, total, estado) VALUES (?, ?, ?)',
            [req.user.id, total, estado || 'pendiente']
        );
        const orderId = result.lastID;

        // Insert order items
        for (const item of items) {
            await db.run(
                'INSERT INTO orden_items (orden_id, producto_id, cantidad, precio) VALUES (?, ?, ?, ?)',
                [orderId, item.producto_id, item.cantidad, item.precio]
            );
        }

        // Fetch the new order with items
        const newOrder = await db.get('SELECT * FROM ordenes WHERE id = ?', [orderId]);
        const orderItems = await db.all('SELECT * FROM orden_items WHERE orden_id = ?', [orderId]);
        newOrder.items = orderItems;

        res.status(201).json(newOrder);
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/orders/:id - Update an order if it belongs to the authenticated user
router.put('/:id', async (req, res) => {
    try {
        const db = await dbPromise;
        const { id } = req.params;
        const { total, estado } = req.body;

        const order = await db.get('SELECT * FROM ordenes WHERE id = ?', [id]);
        if (!order || order.usuario_id !== req.user.id) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const result = await db.run(
            'UPDATE ordenes SET total = ?, estado = ? WHERE id = ?',
            [total, estado, id]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const updatedOrder = await db.get('SELECT * FROM ordenes WHERE id = ?', [id]);
        res.json(updatedOrder);
    } catch (err) {
        console.error('Error updating order:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/orders/:id - Delete an order if it belongs to the authenticated user
router.delete('/:id', async (req, res) => {
    try {
        const db = await dbPromise;
        const { id } = req.params;

        const order = await db.get('SELECT * FROM ordenes WHERE id = ?', [id]);
        if (!order || order.usuario_id !== req.user.id) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const result = await db.run('DELETE FROM ordenes WHERE id = ?', [id]);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        console.error('Error deleting order:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
