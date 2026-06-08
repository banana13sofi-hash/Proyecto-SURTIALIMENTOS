import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';

// SQLite database configuration
const dbPromise = open({
    filename: process.env.DB_NAME || './database.db',
    driver: sqlite3.Database,
});

// Initialize database and create tables
async function initializeDatabase() {
    const db = await dbPromise;

    // Create productos table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            descripcion TEXT,
            precio REAL NOT NULL,
            stock INTEGER DEFAULT 0,
            categoria TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create ordenes table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS ordenes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            total REAL NOT NULL,
            estado TEXT DEFAULT 'pendiente',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create orden_items table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS orden_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            orden_id INTEGER,
            producto_id INTEGER,
            cantidad INTEGER NOT NULL,
            precio REAL NOT NULL,
            FOREIGN KEY (orden_id) REFERENCES ordenes (id),
            FOREIGN KEY (producto_id) REFERENCES productos (id)
        )
    `);

    // Create usuarios table for authentication
    await db.exec(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Insert sample data
    try {
        await db.run(`INSERT OR IGNORE INTO productos (nombre, descripcion, precio, stock, categoria) VALUES
            ('Producto 1', 'Descripción del producto 1', 10.99, 100, 'Categoría A'),
            ('Producto 2', 'Descripción del producto 2', 15.50, 50, 'Categoría B'),
            ('Producto 3', 'Descripción del producto 3', 20.00, 75, 'Categoría A')`);

        await db.run(`INSERT OR IGNORE INTO ordenes (usuario_id, total, estado) VALUES
            (1, 21.98, 'completado'),
            (2, 15.50, 'pendiente')`);

        const sampleUsers = [
            { usuario: 'juan', password: 'clave123', email: 'juan@example.com' },
            { usuario: 'maria', password: 'superpass', email: 'maria@example.com' },
            { usuario: 'admin', password: 'admin123', email: 'admin@surtialimentos.com' },
        ];

        for (const sample of sampleUsers) {
            const hashedPassword = await bcrypt.hash(sample.password, 10);
            await db.run(
                'INSERT OR IGNORE INTO usuarios (usuario, password, email) VALUES (?, ?, ?)',
                [sample.usuario, hashedPassword, sample.email]
            );
        }
    } catch (error) {
        console.log('Sample data already exists or error:', error.message);
    }

    console.log('Database initialized successfully');
}

// Initialize database on module load
initializeDatabase().catch(console.error);

export default dbPromise;
