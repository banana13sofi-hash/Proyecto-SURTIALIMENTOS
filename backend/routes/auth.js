import express from 'express';
import pool from '../bd.js';

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
    const { usuario, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE usuario = $1 AND "password" = $2', [usuario, password]);

        if (result.rows.length > 0) {
            res.json({ success: true, message: 'Login successful', user: result.rows[0] });
        } else {
            res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Register route
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const result = await pool.query('INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *', [username, password, email]);
        res.json({ success: true, message: 'User registered successfully', user: result.rows[0] });
    } catch (err) {
        console.error('Error during registration:', err);
        if (err.code === '23505') { // Unique violation
            res.status(400).json({ success: false, message: 'Username already exists' });
        } else {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
});

export default router;
