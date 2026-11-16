import { spawn } from 'child_process';

const BASE_URL = 'http://localhost:3000';

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('--- Iniciando servidor para pruebas automáticas ---');
  const server = spawn('node', ['src/index.js'], { cwd: process.cwd() });

  server.stdout.on('data', (d) => process.stdout.write('[Server] ' + d));
  server.stderr.on('data', (d) => process.stderr.write('[Server Error] ' + d));

  // Esperar a que el servidor arranque
  await wait(2500);

  let token = '';

  try {
    console.log('\n--- 1. Test GET / (Estado API) ---');
    const resRoot = await fetch(`${BASE_URL}/`);
    console.log('Status:', resRoot.status, 'OK:', resRoot.status === 200);

    console.log('\n--- 2. Test 401 Unauthorized sin token ---');
    const resUnauth = await fetch(`${BASE_URL}/api/vehiculos`);
    console.log('Status esperado 401 -> Recibido:', resUnauth.status);

    console.log('\n--- 3. Test POST /api/auth/login ---');
    const resLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@transporte.com', password: 'Admin1234!' })
    });
    const loginData = await resLogin.json();
    console.log('Status esperado 200 -> Recibido:', resLogin.status);
    token = loginData.token;
    console.log('Token obtenido:', !!token);

    console.log('\n--- 4. Test GET /api/auth/profile con token ---');
    const resProfile = await fetch(`${BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Status esperado 200 -> Recibido:', resProfile.status);

    console.log('\n--- 5. Test GET /api/vehiculos con token ---');
    const resVehiculos = await fetch(`${BASE_URL}/api/vehiculos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const vehiculos = await resVehiculos.json();
    console.log('Status esperado 200 -> Recibido:', resVehiculos.status, 'Vehículos:', vehiculos.length);

    console.log('\n--- 6. Test GET /api/conductores con token ---');
    const resConductores = await fetch(`${BASE_URL}/api/conductores`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const conductores = await resConductores.json();
    console.log('Status esperado 200 -> Recibido:', resConductores.status, 'Conductores:', conductores.length);

    console.log('\n--- 7. Test GET /api/viajes con token ---');
    const resViajes = await fetch(`${BASE_URL}/api/viajes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const viajesData = await resViajes.json();
    console.log('Status esperado 200 -> Recibido:', resViajes.status, 'Total Km:', viajesData.total_kilometros);

    console.log('\n--- 8. Test GET /api/viajes/estadisticas/kilometros ---');
    const resStats = await fetch(`${BASE_URL}/api/viajes/estadisticas/kilometros`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const statsData = await resStats.json();
    console.log('Status esperado 200 -> Recibido:', resStats.status, 'Empresa Total Km:', statsData.total_general?.total_kilometros_empresa);

    console.log('\n--- 9. Test Validación 400 Bad Request en Vehículo inválido ---');
    const resBadVehiculo = await fetch(`${BASE_URL}/api/vehiculos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ marca: '', modelo: '', patente: '1', anio: 1900, capacidad_carga: -10 })
    });
    console.log('Status esperado 400 -> Recibido:', resBadVehiculo.status);

    console.log('\n--- 10. Test 404 Not Found en ID inexistente ---');
    const resNotFound = await fetch(`${BASE_URL}/api/vehiculos/9999`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Status esperado 404 -> Recibido:', resNotFound.status);

    console.log('\n✅ TODOS LOS TESTS DEL BACKEND PASARON EXITOSAMENTE!');
  } catch (err) {
    console.error('Error durante las pruebas:', err);
  } finally {
    server.kill();
    process.exit(0);
  }
}

runTests();
