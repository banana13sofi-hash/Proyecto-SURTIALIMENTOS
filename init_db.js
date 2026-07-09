import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcryptjs";

const dbPromise = open({
    filename: "./database.db",
    driver: sqlite3.Database,
});

async function createTables() {
    const db = await dbPromise;

    try {
        // PRODUCTOS
        await db.exec(`
            CREATE TABLE IF NOT EXISTS productos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                descripcion TEXT,
                precio REAL NOT NULL,
                stock INTEGER DEFAULT 0,
                categoria TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // ORDENES
        await db.exec(`
            CREATE TABLE IF NOT EXISTS ordenes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER,
                total REAL NOT NULL,
                estado TEXT DEFAULT 'pendiente',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // USUARIOS
        await db.exec(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                email TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("✔ Tablas creadas correctamente");

        // DATOS DE PRUEBA
        await db.run(`
            INSERT OR IGNORE INTO productos (nombre, descripcion, precio, stock, categoria)
            VALUES
            ('Producto 1', 'Descripción 1', 10.99, 100, 'A'),
            ('Producto 2', 'Descripción 2', 15.50, 50, 'B');
        `);

        const users = [
            { usuario: "admin", password: "admin123", email: "admin@test.com" },
            { usuario: "juan", password: "123456", email: "juan@test.com" }
        ];

        for (const u of users) {
            const hash = await bcrypt.hash(u.password, 10);

            await db.run(
                `INSERT OR IGNORE INTO usuarios (usuario, password, email)
                 VALUES (?, ?, ?)`,
                [u.usuario, hash, u.email]
            );
        }

        console.log("✔ Datos insertados correctamente");

    } catch (err) {
        console.error("❌ Error:", err);
    }
}

createTables();
