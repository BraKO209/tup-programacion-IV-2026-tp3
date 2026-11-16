import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_NAME || 'tp3_transporte',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
};

// Pool de conexiones
export const pool = mysql.createPool(dbConfig);

/**
 * Inicializa la base de datos, crea tablas y datos iniciales si no existen
 */
export async function initDatabase() {
  try {
    // Conexión administrativa sin especificar base de datos
    const adminConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    await adminConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await adminConnection.end();

    // 1. Tabla Usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`usuarios\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`nombre\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(150) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 2. Tabla Vehiculos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`vehiculos\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`marca\` VARCHAR(100) NOT NULL,
        \`modelo\` VARCHAR(100) NOT NULL,
        \`patente\` VARCHAR(20) NOT NULL UNIQUE,
        \`anio\` INT NOT NULL,
        \`capacidad_carga\` DECIMAL(10, 2) NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 3. Tabla Conductores
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`conductores\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`nombre\` VARCHAR(100) NOT NULL,
        \`apellido\` VARCHAR(100) NOT NULL,
        \`numero_documento\` VARCHAR(20) NOT NULL UNIQUE,
        \`numero_licencia\` VARCHAR(50) NOT NULL UNIQUE,
        \`fecha_alta_licencia\` DATE NOT NULL,
        \`fecha_vencimiento_licencia\` DATE NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 4. Tabla Viajes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`viajes\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`vehiculo_id\` INT NOT NULL,
        \`conductor_id\` INT NOT NULL,
        \`fecha_salida\` DATETIME NOT NULL,
        \`fecha_llegada\` DATETIME NOT NULL,
        \`origen\` VARCHAR(150) NOT NULL,
        \`destino\` VARCHAR(150) NOT NULL,
        \`kilometros\` DECIMAL(10, 2) NOT NULL,
        \`observaciones\` TEXT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_viajes_vehiculo\`
          FOREIGN KEY (\`vehiculo_id\`) REFERENCES \`vehiculos\` (\`id\`)
          ON UPDATE CASCADE ON DELETE RESTRICT,
        CONSTRAINT \`fk_viajes_conductor\`
          FOREIGN KEY (\`conductor_id\`) REFERENCES \`conductores\` (\`id\`)
          ON UPDATE CASCADE ON DELETE RESTRICT
      ) ENGINE=InnoDB;
    `);

    // Comprobar si hay un usuario administrador inicial
    const [usuarios] = await pool.query('SELECT id FROM usuarios LIMIT 1');
    if (usuarios.length === 0) {
      const hashedPassword = await bcrypt.hash('Admin1234!', 10);
      await pool.query(
        'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
        ['Administrador', 'admin@transporte.com', hashedPassword]
      );
      console.log('✅ Usuario demo creado: admin@transporte.com / Pass: Admin1234!');
    }

    // Comprobar si hay vehículos iniciales
    const [vehiculos] = await pool.query('SELECT id FROM vehiculos LIMIT 1');
    if (vehiculos.length === 0) {
      await pool.query(`
        INSERT INTO vehiculos (marca, modelo, patente, anio, capacidad_carga) VALUES
        ('Mercedes-Benz', 'Actros 2645', 'AE123CD', 2023, 25000.00),
        ('Scania', 'R500 Highline', 'AF456GH', 2024, 28000.00),
        ('Volvo', 'FH 460', 'AD789JK', 2022, 24000.00);
      `);
    }

    // Comprobar si hay conductores iniciales
    const [conductores] = await pool.query('SELECT id FROM conductores LIMIT 1');
    if (conductores.length === 0) {
      await pool.query(`
        INSERT INTO conductores (nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia) VALUES
        ('Carlos', 'González', '32456789', 'LIC-AR-00129', '2018-05-10', '2028-05-10'),
        ('Juan Manuel', 'López', '34123456', 'LIC-AR-00345', '2019-08-15', '2029-08-15'),
        ('Esteban', 'Martínez', '36789123', 'LIC-AR-00567', '2021-03-20', '2027-03-20');
      `);
    }

    // Comprobar si hay viajes iniciales
    const [viajes] = await pool.query('SELECT id FROM viajes LIMIT 1');
    if (viajes.length === 0) {
      await pool.query(`
        INSERT INTO viajes (vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones) VALUES
        (1, 1, '2026-11-01 08:00:00', '2026-11-01 20:30:00', 'La Rioja (Capital)', 'Córdoba (Centro)', 440.50, 'Entrega de carga industrial sin novedades.'),
        (2, 2, '2026-11-03 06:00:00', '2026-11-04 14:00:00', 'La Rioja (Capital)', 'Buenos Aires (Puerto)', 1150.00, 'Viaje de larga distancia con refrigeración.'),
        (1, 3, '2026-11-08 09:00:00', '2026-11-08 17:00:00', 'Córdoba (Centro)', 'Rosario (Sur)', 400.00, 'Ruta despejada, combustible cargado en Villa María.');
      `);
    }

    console.log('✅ Base de datos y tablas inicializadas correctamente en MySQL.');
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    throw error;
  }
}
