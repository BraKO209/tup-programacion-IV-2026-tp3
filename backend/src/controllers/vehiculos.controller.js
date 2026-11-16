import { pool } from '../config/db.js';

/**
 * Obtener todos los vehículos
 */
export const getAllVehiculos = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT v.*, 
              COUNT(vi.id) AS total_viajes,
              COALESCE(SUM(vi.kilometros), 0) AS total_kilometros
       FROM vehiculos v
       LEFT JOIN viajes vi ON vi.vehiculo_id = v.id
       GROUP BY v.id
       ORDER BY v.id DESC`
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error en getAllVehiculos:', error);
    return res.status(500).json({
      error: 'Error interno al obtener los vehículos.',
      details: error.message
    });
  }
};

/**
 * Obtener un vehículo por ID
 */
export const getVehiculoById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT v.*, 
              COUNT(vi.id) AS total_viajes,
              COALESCE(SUM(vi.kilometros), 0) AS total_kilometros
       FROM vehiculos v
       LEFT JOIN viajes vi ON vi.vehiculo_id = v.id
       WHERE v.id = ?
       GROUP BY v.id`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: `No se encontró ningún vehículo con el ID ${id}.`
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error en getVehiculoById:', error);
    return res.status(500).json({
      error: 'Error interno al consultar el vehículo.',
      details: error.message
    });
  }
};

/**
 * Crear un nuevo vehículo
 */
export const createVehiculo = async (req, res) => {
  const { marca, modelo, patente, anio, capacidad_carga } = req.body;
  const patenteFormateada = patente.trim().toUpperCase();

  try {
    // Comprobar patente única
    const [existente] = await pool.query(
      'SELECT id FROM vehiculos WHERE patente = ?',
      [patenteFormateada]
    );

    if (existente.length > 0) {
      return res.status(400).json({
        error: `Ya existe un vehículo registrado con la patente "${patenteFormateada}".`
      });
    }

    const [result] = await pool.query(
      'INSERT INTO vehiculos (marca, modelo, patente, anio, capacidad_carga) VALUES (?, ?, ?, ?, ?)',
      [marca.trim(), modelo.trim(), patenteFormateada, anio, capacidad_carga]
    );

    const [nuevoVehiculo] = await pool.query('SELECT * FROM vehiculos WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      message: 'Vehículo registrado correctamente.',
      vehiculo: nuevoVehiculo[0]
    });
  } catch (error) {
    console.error('Error en createVehiculo:', error);
    return res.status(500).json({
      error: 'Error interno al registrar el vehículo.',
      details: error.message
    });
  }
};

/**
 * Actualizar un vehículo existente
 */
export const updateVehiculo = async (req, res) => {
  const { id } = req.params;
  const { marca, modelo, patente, anio, capacidad_carga } = req.body;
  const patenteFormateada = patente.trim().toUpperCase();

  try {
    // Verificar si existe el vehículo
    const [vehiculoActual] = await pool.query('SELECT id FROM vehiculos WHERE id = ?', [id]);
    if (vehiculoActual.length === 0) {
      return res.status(404).json({
        error: `No se encontró ningún vehículo con el ID ${id} para actualizar.`
      });
    }

    // Verificar si la nueva patente está en uso por otro vehículo
    const [patenteExistente] = await pool.query(
      'SELECT id FROM vehiculos WHERE patente = ? AND id != ?',
      [patenteFormateada, id]
    );

    if (patenteExistente.length > 0) {
      return res.status(400).json({
        error: `La patente "${patenteFormateada}" ya está asignada a otro vehículo.`
      });
    }

    await pool.query(
      'UPDATE vehiculos SET marca = ?, modelo = ?, patente = ?, anio = ?, capacidad_carga = ? WHERE id = ?',
      [marca.trim(), modelo.trim(), patenteFormateada, anio, capacidad_carga, id]
    );

    const [actualizado] = await pool.query('SELECT * FROM vehiculos WHERE id = ?', [id]);

    return res.status(200).json({
      message: 'Vehículo actualizado correctamente.',
      vehiculo: actualizado[0]
    });
  } catch (error) {
    console.error('Error en updateVehiculo:', error);
    return res.status(500).json({
      error: 'Error interno al actualizar el vehículo.',
      details: error.message
    });
  }
};

/**
 * Eliminar un vehículo
 */
export const deleteVehiculo = async (req, res) => {
  const { id } = req.params;

  try {
    const [vehiculo] = await pool.query('SELECT * FROM vehiculos WHERE id = ?', [id]);
    if (vehiculo.length === 0) {
      return res.status(404).json({
        error: `No se encontró ningún vehículo con el ID ${id}.`
      });
    }

    // Verificar si tiene viajes asociados
    const [viajes] = await pool.query('SELECT id FROM viajes WHERE vehiculo_id = ? LIMIT 1', [id]);
    if (viajes.length > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar el vehículo porque posee viajes asociados en el sistema.'
      });
    }

    await pool.query('DELETE FROM vehiculos WHERE id = ?', [id]);

    return res.status(200).json({
      message: `Vehículo con ID ${id} (${vehiculo[0].marca} ${vehiculo[0].modelo} - ${vehiculo[0].patente}) eliminado con éxito.`
    });
  } catch (error) {
    console.error('Error en deleteVehiculo:', error);
    return res.status(500).json({
      error: 'Error interno al eliminar el vehículo.',
      details: error.message
    });
  }
};
