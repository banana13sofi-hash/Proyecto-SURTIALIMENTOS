// SCRIPT DE PRUEBA - NO USAR EN PRODUCCIÓN
// Para registrar nuevos usuarios, usa curl o Postman contra http://localhost:3001/api/register
// Ejemplo:
// curl -X POST http://localhost:3001/api/register \
//   -H "Content-Type: application/json" \
//   -d '{"usuario":"newuser","password":"securepass","email":"user@example.com"}'

// Variables de entorno requeridas:
// USUARIO=nombre_usuario (nuevo usuario a registrar)
// PASSWORD=password (contraseña del nuevo usuario)
// EMAIL=email@example.com (email del nuevo usuario)

const usuario = process.env.USUARIO;
const password = process.env.PASSWORD;
const email = process.env.EMAIL;

if (!usuario || !password || !email) {
    console.error('ERROR: Debes proporcionar USUARIO, PASSWORD y EMAIL como variables de entorno');
    console.error('Uso: USUARIO=user PASSWORD=pass EMAIL=user@example.com node test_new_users.js');
    process.exit(1);
}

async function testRegister() {
    try {
        const response = await fetch('http://localhost:3001/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password, email })
        });
        const result = await response.json();
        console.log(`Register test for ${usuario}:`, result.success ? 'SUCCESS' : 'FAILED');
        console.log('Response:', result);
    } catch (err) {
        console.error(`Error for ${usuario}:`, err.message);
    }
}

testRegister();
