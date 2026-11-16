-- ==========================================================
-- Base de Datos: Sistema de Gestión de Transporte
-- Trabajo Práctico N.° 3 - Programación IV (UTN FR La Rioja)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `tp3_transporte`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `tp3_transporte`;

-- ----------------------------------------------------------
-- 1. Tabla de Usuarios (para autenticación JWT)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 2. Tabla de Vehículos
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `vehiculos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `marca` VARCHAR(100) NOT NULL,
  `modelo` VARCHAR(100) NOT NULL,
  `patente` VARCHAR(20) NOT NULL UNIQUE,
  `anio` INT NOT NULL,
  `capacidad_carga` DECIMAL(10, 2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 3. Tabla de Conductores
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `conductores` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `numero_documento` VARCHAR(20) NOT NULL UNIQUE,
  `numero_licencia` VARCHAR(50) NOT NULL UNIQUE,
  `fecha_alta_licencia` DATE NOT NULL,
  `fecha_vencimiento_licencia` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 4. Tabla de Viajes
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `viajes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `vehiculo_id` INT NOT NULL,
  `conductor_id` INT NOT NULL,
  `fecha_salida` DATETIME NOT NULL,
  `fecha_llegada` DATETIME NOT NULL,
  `origen` VARCHAR(150) NOT NULL,
  `destino` VARCHAR(150) NOT NULL,
  `kilometros` DECIMAL(10, 2) NOT NULL,
  `observaciones` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_viajes_vehiculo`
    FOREIGN KEY (`vehiculo_id`) REFERENCES `vehiculos` (`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_viajes_conductor`
    FOREIGN KEY (`conductor_id`) REFERENCES `conductores` (`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ==========================================================
-- Datos Semilla de Prueba (Opcional)
-- Usuario demo: admin@transporte.com / Pass: Admin1234!
INSERT IGNORE INTO `usuarios` (`id`, `nombre`, `email`, `password`) VALUES
(1, 'Administrador', 'admin@transporte.com', '$2b$10$sAf1fcuS.t9h3dV.2C7ssOnMRCs7DFHXuCvhl7lOCVVOZWi4TqRTm');

INSERT IGNORE INTO `vehiculos` (`id`, `marca`, `modelo`, `patente`, `anio`, `capacidad_carga`) VALUES
(1, 'Mercedes-Benz', 'Actros 2645', 'AE123CD', 2023, 25000.00),
(2, 'Scania', 'R500 Highline', 'AF456GH', 2024, 28000.00),
(3, 'Volvo', 'FH 460', 'AD789JK', 2022, 24000.00);

INSERT IGNORE INTO `conductores` (`id`, `nombre`, `apellido`, `numero_documento`, `numero_licencia`, `fecha_alta_licencia`, `fecha_vencimiento_licencia`) VALUES
(1, 'Carlos', 'González', '32456789', 'LIC-AR-00129', '2018-05-10', '2028-05-10'),
(2, 'Juan Manuel', 'López', '34123456', 'LIC-AR-00345', '2019-08-15', '2029-08-15'),
(3, 'Esteban', 'Martínez', '36789123', 'LIC-AR-00567', '2021-03-20', '2027-03-20');

INSERT IGNORE INTO `viajes` (`id`, `vehiculo_id`, `conductor_id`, `fecha_salida`, `fecha_llegada`, `origen`, `destino`, `kilometros`, `observaciones`) VALUES
(1, 1, 1, '2026-11-01 08:00:00', '2026-11-01 20:30:00', 'La Rioja (Capital)', 'Córdoba (Centro)', 440.50, 'Entrega de carga industrial sin novedades.'),
(2, 2, 2, '2026-11-03 06:00:00', '2026-11-04 14:00:00', 'La Rioja (Capital)', 'Buenos Aires (Puerto)', 1150.00, 'Viaje de larga distancia con refrigeración.'),
(3, 1, 3, '2026-11-08 09:00:00', '2026-11-08 17:00:00', 'Córdoba (Centro)', 'Rosario (Sur)', 400.00, 'Ruta despejada, combustible cargado en Villa María.');
