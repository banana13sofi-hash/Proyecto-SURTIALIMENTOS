import pool from './backend/bd.js';

async function testLogin() {
    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE usuario = $1 AND "password" = $2', ['juan', 'clave123']);
        console.log('Login test result:', result.rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

testLogin();
