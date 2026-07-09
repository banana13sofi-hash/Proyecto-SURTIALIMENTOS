import fs from 'fs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Cargar variables PG desde backend/.env para este script
dotenv.config({ path: process.cwd() + '/backend/.env' });

import pool from './bd.js';


// Este script migra una BD SQLite local hacia PostgreSQL.
// Por defecto lee `./database.db` (raíz) y/o `./backend/database.db` si existe.
// Si tu SQLite usa otro archivo, ajusta SQLITE_DB_CANDIDATES.

const SQLITE_DB_CANDIDATES = [
    './backend/database.db',
    './database.db',
];


function pickSqlitePath() {
    for (const p of SQLITE_DB_CANDIDATES) {
        if (fs.existsSync(p)) return p;
    }
    throw new Error(`No se encontró archivo SQLite. Intenté: ${SQLITE_DB_CANDIDATES.join(', ')}`);
}

function toIntSafe(v) {
    if (v === null || v === undefined) return 0;
    // si viene tipo "12" o "12.3" intentamos parsear
    const n = Number(v);
    if (Number.isFinite(n)) return Math.trunc(n);
    // si viene tipo "subcat-Carnes-Pollo" devolvemos 0
    return 0;
}

function toDecimalSafe(v) {
    if (v === null || v === undefined) return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

async function migrate() {
    const sqlitePath = pickSqlitePath();
    console.log('✅ SQLite encontrado:', sqlitePath);


    const sqlite = await open({
        filename: sqlitePath,
        driver: sqlite3.Database,
    });

    // Asegura tablas en Postgres
    await pool.query(`
    CREATE TABLE IF NOT EXISTS productos (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      descripcion TEXT,
      precio DECIMAL(10,2) NOT NULL,
      stock INTEGER DEFAULT 0,
      categoria VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ordenes (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER,
      total DECIMAL(10,2) NOT NULL,
      estado VARCHAR(50) DEFAULT 'pendiente',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orden_items (
      id SERIAL PRIMARY KEY,
      orden_id INTEGER,
      producto_id INTEGER,
      cantidad INTEGER NOT NULL,
      precio DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (orden_id) REFERENCES ordenes(id),
      FOREIGN KEY (producto_id) REFERENCES productos(id)
    );

    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      usuario VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

    // Leer desde SQLite (si no existen las tablas, no hay nada que migrar)
    const tables = await sqlite.all("SELECT name FROM sqlite_master WHERE type='table'");
    const tableNames = new Set(tables.map(t => t.name));

    const productos = tableNames.has('productos')
        ? await sqlite.all('SELECT * FROM productos')
        : [];
    const usuarios = tableNames.has('usuarios')
        ? await sqlite.all('SELECT * FROM usuarios')
        : [];
    const ordenes = tableNames.has('ordenes')
        ? await sqlite.all('SELECT * FROM ordenes')
        : [];
    const orden_items = tableNames.has('orden_items')
        ? await sqlite.all('SELECT * FROM orden_items')
        : [];


    console.log(`Datos SQLite: productos=${productos.length}, usuarios=${usuarios.length}, ordenes=${ordenes.length}, items=${orden_items.length}`);

    // Insertar en Postgres (mantenemos IDs para consistencia)
    // Nota: para permitir IDs, usamos SETVAL/explicit insert con id.

    // Productos
    for (const p of productos) {
        try {
            const stockNum = toIntSafe(p.stock);
            const precioNum = toDecimalSafe(p.precio);
            const idNum = toIntSafe(p.id);

            await pool.query(
                `INSERT INTO productos (id, nombre, descripcion, precio, stock, categoria, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT (id) DO NOTHING;`,
                [
                    idNum,
                    p.nombre,
                    p.descripcion,
                    precioNum,
                    stockNum,
                    p.categoria,
                    p.created_at
                ]
            );
        } catch (err) {
            console.error('❌ Fallo insert productos:', { id: p?.id, nombre: p?.nombre, stock: p?.stock, precio: p?.precio, categoria: p?.categoria, descripcion: p?.descripcion });
            console.error('   Error:', err?.message);
        }
    }





    // Usuarios
    for (const u of usuarios) {
        try {
            const idNum = toIntSafe(u.id);
            await pool.query(
                `INSERT INTO usuarios (id, usuario, password, email, created_at)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (usuario) DO NOTHING;`,
                [idNum, u.usuario, u.password, u.email, u.created_at]
            );
        } catch (err) {
            console.error('❌ Fallo insert usuarios:', { id: u?.id, usuario: u?.usuario });
            console.error('   Error:', err?.message);
        }
    }


    // Ordenes
    for (const o of ordenes) {
        try {
            const idNum = toIntSafe(o.id);
            const usuarioIdNum = toIntSafe(o.usuario_id);
            const totalNum = toDecimalSafe(o.total);

            await pool.query(
                `INSERT INTO ordenes (id, usuario_id, total, estado, created_at)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (id) DO NOTHING;`,
                [idNum, usuarioIdNum, totalNum, o.estado, o.created_at]
            );
        } catch (err) {
            console.error('❌ Fallo insert ordenes:', {
                id: o?.id,
                usuario_id: o?.usuario_id,
                total: o?.total,
                estado: o?.estado,
                idNum: toIntSafe(o?.id),
                usuarioIdNum: toIntSafe(o?.usuario_id),
                totalNum: toDecimalSafe(o?.total),
            });
            console.error('   Error:', err?.message);
        }
    }



    // Orden items
    // Nota: en tu SQLite, orden_items.producto_id viene a veces como string tipo "subcat-Carnes-Pollo".
    // No es un id numérico, así que hacemos mapeo por categoría.

    // Construir un mapa de categoria -> id de producto (el primero que aparezca)
    const productosMapPorCategoria = new Map();
    for (const p of productos) {
        const categoria = p?.categoria;
        if (categoria && !productosMapPorCategoria.has(String(categoria).toLowerCase())) {
            productosMapPorCategoria.set(String(categoria).toLowerCase(), toIntSafe(p?.id));
        }
    }

    function normalizarProductoId(it) {
        const raw = it?.producto_id;
        const direct = toIntSafe(raw);
        if (Number.isFinite(direct) && direct !== 0) return direct;

        // Si viene como subcat-<categoria>
        if (typeof raw === 'string' && raw.startsWith('subcat-')) {
            const subcat = raw.slice('subcat-'.length).trim(); // Carnes-Pollo

            // Tu SQLite parece tener productos.categoria solo con 'Categoría A/B',
            // así que mapeamos por "si subcat contiene X".
            // (Ajusta reglas si más adelante aparecen más categorías reales.)
            const s = subcat.toLowerCase();
            if (s.includes('carnes') || s.includes('pollo')) {
                const mapped = productosMapPorCategoria.get('categoría a') || productosMapPorCategoria.get('categoria a');
                if (mapped) return mapped;
            }
            if (s.includes('frutas') || s.includes('banana') || s.includes('banano')) {
                const mapped = productosMapPorCategoria.get('categoría b') || productosMapPorCategoria.get('categoria b');
                if (mapped) return mapped;
            }

            // Fallback: intentar coincidencia exacta por categoria normalizada
            const mapped = productosMapPorCategoria.get(String(subcat).toLowerCase());
            if (mapped) return mapped;

        }

        return 0;
    }

    for (const it of orden_items) {
        try {
            const idNum = toIntSafe(it.id);
            const ordenIdNum = toIntSafe(it.orden_id);
            const productoIdNum = normalizarProductoId(it);
            const cantidadNum = (it.cantidad === null || it.cantidad === undefined) ? 0 : Number(it.cantidad);
            const precioNum = (it.precio === null || it.precio === undefined) ? 0 : Number(it.precio);

            await pool.query(
                `INSERT INTO orden_items (id, orden_id, producto_id, cantidad, precio)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (id) DO NOTHING;`,
                [
                    idNum,
                    ordenIdNum,
                    productoIdNum,
                    Number.isFinite(cantidadNum) ? toIntSafe(cantidadNum) : 0,
                    Number.isFinite(precioNum) ? toDecimalSafe(precioNum) : 0
                ]
            );
        } catch (err) {
            console.error('❌ Fallo insert orden_items:', {
                id: it?.id,
                orden_id: it?.orden_id,
                producto_id: it?.producto_id,
                cantidad: it?.cantidad,
                precio: it?.precio,
                productoIdMapped: normalizarProductoId(it),
            });
            console.error('   Error:', err?.message);
        }
    }




    console.log('🎉 Migración completada.');
    await sqlite.close();
    await pool.end();
}

migrate().catch(async (e) => {
    console.error('❌ Error migrando:', e);
    try {
        await pool.end();
    } catch (_) { }
    process.exit(1);
});

