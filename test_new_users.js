import pool from './backend/bd.js';

async function testNewUsers() {
    const users = [
        { usuario: 'JuanBarbosa', password: '123456' },
        { usuario: 'ZoeTrent', password: 'Superstar' },
        { usuario: 'Admin', password: 'Bananita' }
    ];

    for (const user of users) {
        try {
            const result = await pool.query('SELECT * FROM usuarios WHERE usuario = $1 AND "password" = $2', [user.usuario, user.password]);
            console.log(`Login test for ${user.usuario}:`, result.rows.length > 0 ? 'SUCCESS' : 'FAILED');
            if (result.rows.length > 0) {
                console.log('User data:', result.rows[0]);
            }
        } catch (err) {
            console.error(`Error for ${user.usuario}:`, err);
        }
    }

    pool.end();
}

testNewUsers();
