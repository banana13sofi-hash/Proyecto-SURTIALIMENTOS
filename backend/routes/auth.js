import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../bd.js';

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || 'dev_secret';
const jwtOptions = { expiresIn: '8h' };

// POST /api/login
router.post('/login', async (req, res) => {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
        return res.status(400).json({ success: false, message: 'Usuario y contraseña son requeridos' });
    }

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
            return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
        }

        const token = jwt.sign({ id: user.id, usuario: user.usuario }, jwtSecret, jwtOptions);
        const { password: _, ...userSafe } = user;

        return res.json({ success: true, message: 'Login successful', token, user: userSafe });
    } catch (err) {
        console.error('Error during login:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// POST /api/register
router.post('/register', async (req, res) => {
    const { usuario, password, email } = req.body;

    if (!usuario || !password || !email) {
        return res.status(400).json({ success: false, message: 'Usuario, contraseña y email son requeridos' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO usuarios (usuario, password, email) VALUES ($1, $2, $3) RETURNING id, usuario, email, created_at',
            [usuario, hashedPassword, email]
        );

        return res.json({
            success: true,
            message: 'User registered successfully',
            user: result.rows[0],
        });
    } catch (err) {
        console.error('Error during registration:', err);

        if (String(err?.message || '').includes('duplicate key')) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export default router;

