import express from 'express';
const router = express.Router();
import pool from '../bd.js';

// GET /api/products - Fetch all products or search by name/category
router.get('/', async (req, res) => {
    try {
        const { name, categoria } = req.query;
        let result;

        if (name) {
            const term = `%${name.trim().toLowerCase()}%`;
            result = await pool.query(
                'SELECT * FROM productos WHERE LOWER(nombre) LIKE $1 OR LOWER(descripcion) LIKE $2 OR LOWER(categoria) LIKE $3 ORDER BY id ASC',
                [term, term, term]
            );
        } else if (categoria) {
            result = await pool.query(
                'SELECT * FROM productos WHERE LOWER(categoria) = $1 ORDER BY id ASC',
                [categoria.trim().toLowerCase()]
            );
        } else {
            result = await pool.query('SELECT * FROM productos ORDER BY id ASC');
        }

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
        const result = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
        const product = result.rows[0];
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/products - Create a new product
router.post('/', async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, categoria } = req.body;
        const result = await pool.query(
            'INSERT INTO productos (nombre, descripcion, precio, stock, categoria) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nombre, descripcion, precio, stock, categoria]
        );
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
        const result = await pool.query(
            'UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, stock = $4, categoria = $5 WHERE id = $6 RETURNING *',
            [nombre, descripcion, precio, stock, categoria, id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Product not found' });
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
        const result = await pool.query('DELETE FROM productos WHERE id = $1', [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
