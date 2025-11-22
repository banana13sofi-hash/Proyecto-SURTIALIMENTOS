import pool from './backend/bd.js';

async function insertUsers() {
    try {
        await pool.query('INSERT INTO usuarios (usuario, "password") VALUES ($1, $2)', ['JuanBarbosa', '123456']);
        console.log('Inserted JuanBarbosa');

        await pool.query('INSERT INTO usuarios (usuario, "password") VALUES ($1, $2)', ['ZoeTrent', 'Superstar']);
        console.log('Inserted ZoeTrent');

        await pool.query('INSERT INTO usuarios (usuario, "password") VALUES ($1, $2)', ['Admin', 'Bananita']);
        console.log('Inserted Admin');

        console.log('All users inserted successfully');
    } catch (err) {
        console.error('Error inserting users:', err);
    } finally {
        pool.end();
    }
}

insertUsers();
