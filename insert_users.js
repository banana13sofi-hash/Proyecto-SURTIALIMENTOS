// SCRIPT DE PRUEBA - NO USAR EN PRODUCCIÓN
// Este script es un ejemplo de cómo registrar usuarios.
// Para ambiente real, usa el endpoint /api/register en lugar de este script.

// La mejor práctica es:
// 1. Usar el endpoint POST /api/register desde tu aplicación
// 2. Las contraseñas deben ser hasheadas (bcrypt) - ya lo hace el backend
// 3. NUNCA almacenar contraseñas en claro en el código fuente

const API_URL = process.env.API_URL || 'http://localhost:3001';

// Usuarios de ejemplo - LAS CONTRASEÑAS DEBEN VENIR DE VARIABLES DE ENTORNO EN PRODUCCIÓN
const exampleUsers = [
    { usuario: 'testuser1', email: 'test1@example.com', passwordEnv: 'USER1_PASSWORD' },
    { usuario: 'testuser2', email: 'test2@example.com', passwordEnv: 'USER2_PASSWORD' },
    { usuario: 'testuser3', email: 'test3@example.com', passwordEnv: 'USER3_PASSWORD' }
];

async function registerUsers() {
    for (const user of exampleUsers) {
        const password = process.env[user.passwordEnv];

        if (!password) {
            console.warn(`⚠️  Saltando ${user.usuario}: variable ${user.passwordEnv} no definida`);
            console.warn(`   Usa: ${user.passwordEnv}=mipassword node insert_users.js`);
            continue;
        }

        try {
            const response = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario: user.usuario, password, email: user.email })
            });
            const result = await response.json();
            console.log(`✓ ${user.usuario}:`, result.success ? 'Registrado' : result.message);
        } catch (err) {
            console.error(`✗ Error registrando ${user.usuario}:`, err.message);
        }
    }
}

console.log('Iniciando registro de usuarios...');
console.log('Nota: Las contraseñas vienen de variables de entorno, no del código.\n');
registerUsers();
