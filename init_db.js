import pool from './backend/bd.js';

const createTables = async () => {
    try {
        // Create productos table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS productos (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                descripcion TEXT,
                precio DECIMAL(10, 2) NOT NULL,
                stock INTEGER DEFAULT 0,
                categoria VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create ordenes table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ordenes (
                id SERIAL PRIMARY KEY,
                usuario_id INTEGER,
                total DECIMAL(10, 2) NOT NULL,
                estado VARCHAR(50) DEFAULT 'pendiente',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create usuarios table for authentication
        await pool.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                usuario VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Insert sample data into productos
        await pool.query(`
            INSERT INTO productos (nombre, descripcion, precio, stock, categoria) VALUES
            ('Producto 1', 'Descripción del producto 1', 10.99, 100, 'Categoría A'),
            ('Producto 2', 'Descripción del producto 2', 15.50, 50, 'Categoría B'),
            ('Producto 3', 'Descripción del producto 3', 20.00, 75, 'Categoría A')
            ON CONFLICT DO NOTHING;
        `);

        // Insert sample data into ordenes
        await pool.query(`
            INSERT INTO ordenes (usuario_id, total, estado) VALUES
            (1, 21.98, 'completado'),
            (2, 15.50, 'pendiente')
            ON CONFLICT DO NOTHING;
        `);

        // Insert sample users for login
        await pool.query(`
            INSERT INTO usuarios (usuario, password) VALUES
            ('juan', 'clave123'),
            ('maria', 'superpass'),
            ('admin', 'admin123')
            ON CONFLICT DO NOTHING;
        `);

        console.log('Tables created and sample data inserted successfully');
    } catch (err) {
        console.error('Error creating tables:', err);
    } finally {
        pool.end();
    }
};

createTables();
