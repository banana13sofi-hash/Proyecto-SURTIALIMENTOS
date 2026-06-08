import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbPromise from '../bd.js';

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || 'dev_secret';
const jwtOptions = { expiresIn: '8h' };

// Login route
router.post('/login', async (req, res) => {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
        return res.status(400).json({ success: false, message: 'Usuario y contraseña son requeridos' });
    }

    try {
        const db = await dbPromise;
        const user = await db.get('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
            return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
        }

        const token = jwt.sign({ id: user.id, usuario: user.usuario }, jwtSecret, jwtOptions);
        const { password: _, ...userSafe } = user;

        res.json({ success: true, message: 'Login successful', token, user: userSafe });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Register route
router.post('/register', async (req, res) => {
    const { usuario, password, email } = req.body;

    if (!usuario || !password || !email) {
        return res.status(400).json({ success: false, message: 'Usuario, contraseña y email son requeridos' });
    }

    try {
        const db = await dbPromise;
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.run('INSERT INTO usuarios (usuario, password, email) VALUES (?, ?, ?)', [usuario, hashedPassword, email]);
        const user = await db.get('SELECT id, usuario, email, created_at FROM usuarios WHERE id = ?', [result.lastID]);
        res.json({ success: true, message: 'User registered successfully', user });
    } catch (err) {
        console.error('Error during registration:', err);
        if (err.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ success: false, message: 'Username already exists' });
        } else {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
});

export default router;
