import { initDatabase, pool } from './config/db.js';

async function main() {
  try {
    await initDatabase();
    console.log('Inicialización completada con éxito.');
  } catch (err) {
    console.error('Error fatal al inicializar base de datos:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
