import express from 'express';
const router = express.Router();
import pool from '../bd.js';

// GET /api/products - Fetch all products
router.get('/', async (req, res) => {
    try {
        const query = 'SELECT * FROM productos ORDER BY id ASC';
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/products/:id - Fetch a single product by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT * FROM productos WHERE id = $1';
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/products - Create a new product
router.post('/', async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, categoria } = req.body;
        const query = 'INSERT INTO productos (nombre, descripcion, precio, stock, categoria) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        const result = await pool.query(query, [nombre, descripcion, precio, stock, categoria]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/products/:id - Update a product
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, stock, categoria } = req.body;
        const query = 'UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, stock = $4, categoria = $5 WHERE id = $6 RETURNING *';
        const result = await pool.query(query, [nombre, descripcion, precio, stock, categoria, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/products/:id - Delete a product
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM productos WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
