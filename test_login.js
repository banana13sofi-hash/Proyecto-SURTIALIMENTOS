// SCRIPT DE PRUEBA - NO USAR EN PRODUCCIÓN
// Para probar el login, usa curl o Postman contra http://localhost:3001/api/login
// Ejemplo:
// curl -X POST http://localhost:3001/api/login \
//   -H "Content-Type: application/json" \
//   -d '{"usuario":"juan","password":"clave123"}'

// Variables de entorno requeridas:
// USUARIO=nombre_usuario
// PASSWORD=password_usuario

const usuario = process.env.USUARIO || 'juan';
const password = process.env.PASSWORD;

if (!password) {
    console.error('ERROR: Debes proporcionar la contraseña como variable de entorno PASSWORD');
    console.error('Uso: PASSWORD=<password> node test_login.js');
    process.exit(1);
}

async function testLogin() {
    try {
        const response = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password })
        });
        const result = await response.json();
        console.log('Login test result:', result);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

testLogin();
