import express from 'express';
const router = express.Router();
import dbPromise from '../bd.js';

// GET /api/products - Fetch all products or search by name/category
router.get('/', async (req, res) => {
    try {
        const db = await dbPromise;
        const { name, categoria } = req.query;
        let products;

        if (name) {
            const term = `%${name.trim().toLowerCase()}%`;
            products = await db.all(
                'SELECT * FROM productos WHERE LOWER(nombre) LIKE ? OR LOWER(descripcion) LIKE ? OR LOWER(categoria) LIKE ? ORDER BY id ASC',
                [term, term, term]
            );
        } else if (categoria) {
            products = await db.all(
                'SELECT * FROM productos WHERE LOWER(categoria) = ? ORDER BY id ASC',
                [categoria.trim().toLowerCase()]
            );
        } else {
            products = await db.all('SELECT * FROM productos ORDER BY id ASC');
        }

        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/products/:id - Fetch a single product by ID
router.get('/:id', async (req, res) => {
    try {
        const db = await dbPromise;
        const { id } = req.params;
        const product = await db.get('SELECT * FROM productos WHERE id = ?', [id]);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/products - Create a new product
router.post('/', async (req, res) => {
    try {
        const db = await dbPromise;
        const { nombre, descripcion, precio, stock, categoria } = req.body;
        const result = await db.run(
            'INSERT INTO productos (nombre, descripcion, precio, stock, categoria) VALUES (?, ?, ?, ?, ?)',
            [nombre, descripcion, precio, stock, categoria]
        );
        const newProduct = await db.get('SELECT * FROM productos WHERE id = ?', [result.lastID]);
        res.status(201).json(newProduct);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/products/:id - Update a product
router.put('/:id', async (req, res) => {
    try {
        const db = await dbPromise;
        const { id } = req.params;
        const { nombre, descripcion, precio, stock, categoria } = req.body;
        const result = await db.run(
            'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria = ? WHERE id = ?',
            [nombre, descripcion, precio, stock, categoria, id]
        );
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const updatedProduct = await db.get('SELECT * FROM productos WHERE id = ?', [id]);
        res.json(updatedProduct);
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/products/:id - Delete a product
router.delete('/:id', async (req, res) => {
    try {
        const db = await dbPromise;
        const { id } = req.params;
        const result = await db.run('DELETE FROM productos WHERE id = ?', [id]);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
