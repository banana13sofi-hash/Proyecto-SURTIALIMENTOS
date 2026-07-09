import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '..', 'database.db');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

let activeAdapter = null;

function normalizeSql(sql) {
    return sql.replace(/\$(\d+)/g, '?');
}

async function createSqliteAdapter() {
    const sqliteDb = await open({
        filename: dbPath,
        driver: sqlite3.Database,
    });

    await sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            descripcion TEXT,
            precio REAL NOT NULL,
            stock INTEGER DEFAULT 0,
            categoria TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS ordenes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            total REAL NOT NULL,
            estado TEXT DEFAULT 'pendiente',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS orden_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            orden_id INTEGER NOT NULL,
            producto_id INTEGER,
            cantidad INTEGER NOT NULL,
            precio REAL NOT NULL
        );
    `);

    const productCount = await sqliteDb.get('SELECT COUNT(*) AS count FROM productos');
    if (productCount.count === 0) {
        await sqliteDb.exec(`
            INSERT INTO productos (nombre, descripcion, precio, stock, categoria) VALUES
            ('Manzana', 'Fruta fresca', 3.5, 250, 'Frutas'),
            ('Lechuga', 'Verdura verde', 2.5, 200, 'Verduras'),
            ('Pollo', 'Proteína de pollo', 8.99, 150, 'Carnes'),
            ('Detergente', 'Limpieza del hogar', 4.5, 200, 'Limpieza');
        `);
    }

    const userCount = await sqliteDb.get('SELECT COUNT(*) AS count FROM usuarios');
    if (userCount.count === 0) {
        const users = [
            { usuario: 'admin', password: 'admin123', email: 'admin@test.com' },
            { usuario: 'juan', password: '123456', email: 'juan@test.com' },
        ];

        for (const user of users) {
            const hash = await bcrypt.hash(user.password, 10);
            await sqliteDb.run(
                'INSERT INTO usuarios (usuario, password, email) VALUES (?, ?, ?)',
                [user.usuario, hash, user.email]
            );
        }
    }

    return {
        kind: 'sqlite',
        async query(sql, params = []) {
            const normalizedSql = normalizeSql(sql);
            const isSelect = /^\s*SELECT\s+/i.test(normalizedSql);
            const hasReturning = /RETURNING\s+/i.test(normalizedSql);
            const isInsert = /^\s*INSERT\s+/i.test(normalizedSql);
            const isUpdate = /^\s*UPDATE\s+/i.test(normalizedSql);
            const isDelete = /^\s*DELETE\s+/i.test(normalizedSql);

            if (isSelect) {
                return { rows: await sqliteDb.all(normalizedSql, params), rowCount: 0 };
            }

            if (isInsert && hasReturning) {
                const result = await sqliteDb.run(normalizedSql.replace(/\s+RETURNING\s+.*$/i, ''), params);
                const row = await sqliteDb.get(`SELECT * FROM ${extractTableName(normalizedSql)} WHERE id = ?`, [result.lastID]);
                return { rows: row ? [row] : [], rowCount: 1 };
            }

            if (isUpdate && hasReturning) {
                const result = await sqliteDb.run(normalizedSql.replace(/\s+RETURNING\s+.*$/i, ''), params);
                const match = normalizedSql.match(/\bWHERE\s+id\s*=\s*\?/i);
                const id = match ? params[params.length - 1] : null;
                const row = id !== null ? await sqliteDb.get(`SELECT * FROM ${extractTableName(normalizedSql)} WHERE id = ?`, [id]) : null;
                return { rows: row ? [row] : [], rowCount: result.changes };
            }

            if (isDelete) {
                const result = await sqliteDb.run(normalizedSql, params);
                return { rowCount: result.changes };
            }

            const result = await sqliteDb.run(normalizedSql, params);
            return { rowCount: result.changes };
        },
        async end() {
            await sqliteDb.close();
        },
    };
}

function extractTableName(sql) {
    const match = sql.match(/(?:INSERT\s+INTO|UPDATE)\s+([a-zA-Z0-9_]+)/i);
    return match ? match[1] : 'unknown';
}

async function createPostgresAdapter() {
    const pgPool = new Pool({
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT || 5432),
        database: process.env.PGDATABASE || 'postgres',
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
    });

    await pgPool.query('SELECT 1');

    return {
        kind: 'postgres',
        async query(sql, params = []) {
            return pgPool.query(sql, params);
        },
        async end() {
            await pgPool.end();
        },
    };
}

async function getAdapter() {
    if (activeAdapter) {
        return activeAdapter;
    }

    const hasPostgresConfig = Boolean(process.env.PGHOST || process.env.PGDATABASE || process.env.PGUSER || process.env.PGPASSWORD);

    if (hasPostgresConfig) {
        try {
            activeAdapter = await createPostgresAdapter();
            return activeAdapter;
        } catch (error) {
            console.warn('PostgreSQL no disponible, usando SQLite local:', error.message);
        }
    }

    activeAdapter = await createSqliteAdapter();
    return activeAdapter;
}

const adapter = {
    async query(sql, params = []) {
        const db = await getAdapter();
        return db.query(sql, params);
    },
    async end() {
        if (activeAdapter) {
            await activeAdapter.end();
        }
    },
};

export default adapter;

