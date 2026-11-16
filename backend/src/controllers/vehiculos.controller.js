import { pool } from '../config/db.js';

// Listar todos los vehículos con total de viajes y km
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
    console.error('Error al obtener vehículos:', error);
    return res.status(500).json({
      error: 'Error interno del servidor al consultar vehículos.',
      details: error.message
    });
  }
};

// Obtener un vehículo por ID
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
    console.error('Error al obtener vehículo:', error);
    return res.status(500).json({
      error: 'Error interno al consultar el vehículo.',
      details: error.message
    });
  }
};

// Crear un nuevo vehículo
export const createVehiculo = async (req, res) => {
  const { marca, modelo, patente, anio, capacidad_carga } = req.body;
  const patenteFormateada = patente.trim().toUpperCase();

  try {
    // Verificar que la patente no esté repetida
    const [existente] = await pool.query(
      'SELECT id FROM vehiculos WHERE patente = ?',
      [patenteFormateada]
    );

    if (existente.length > 0) {
      return res.status(400).json({
        error: `La patente "${patenteFormateada}" ya está registrada en otro vehículo.`
      });
    }

    const [result] = await pool.query(
      'INSERT INTO vehiculos (marca, modelo, patente, anio, capacidad_carga) VALUES (?, ?, ?, ?, ?)',
      [marca.trim(), modelo.trim(), patenteFormateada, anio, capacidad_carga]
    );

    const [nuevo] = await pool.query('SELECT * FROM vehiculos WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      message: 'Vehículo registrado con éxito.',
      vehiculo: nuevo[0]
    });
  } catch (error) {
    console.error('Error al crear vehículo:', error);
    return res.status(500).json({
      error: 'Error interno al guardar el vehículo.',
      details: error.message
    });
  }
};

// Modificar un vehículo existente
export const updateVehiculo = async (req, res) => {
  const { id } = req.params;
  const { marca, modelo, patente, anio, capacidad_carga } = req.body;
  const patenteFormateada = patente.trim().toUpperCase();

  try {
    const [actual] = await pool.query('SELECT id FROM vehiculos WHERE id = ?', [id]);
    if (actual.length === 0) {
      return res.status(404).json({
        error: `No se encontró el vehículo con ID ${id}.`
      });
    }

    // Verificar si la patente la tiene otro vehículo diferente
    const [patenteExistente] = await pool.query(
      'SELECT id FROM vehiculos WHERE patente = ? AND id != ?',
      [patenteFormateada, id]
    );

    if (patenteExistente.length > 0) {
      return res.status(400).json({
        error: `La patente "${patenteFormateada}" ya pertenece a otro vehículo registrado.`
      });
    }

    await pool.query(
      'UPDATE vehiculos SET marca = ?, modelo = ?, patente = ?, anio = ?, capacidad_carga = ? WHERE id = ?',
      [marca.trim(), modelo.trim(), patenteFormateada, anio, capacidad_carga, id]
    );

    const [actualizado] = await pool.query('SELECT * FROM vehiculos WHERE id = ?', [id]);

    return res.status(200).json({
      message: 'Vehículo actualizado con éxito.',
      vehiculo: actualizado[0]
    });
  } catch (error) {
    console.error('Error al actualizar vehículo:', error);
    return res.status(500).json({
      error: 'Error interno al actualizar el vehículo.',
      details: error.message
    });
  }
};

// Eliminar un vehículo
export const deleteVehiculo = async (req, res) => {
  const { id } = req.params;

  try {
    const [vehiculo] = await pool.query('SELECT * FROM vehiculos WHERE id = ?', [id]);
    if (vehiculo.length === 0) {
      return res.status(404).json({
        error: `No se encontró ningún vehículo con el ID ${id}.`
      });
    }

    // Comprobamos si tiene viajes asociados para no romper la integridad referencial
    const [viajes] = await pool.query('SELECT id FROM viajes WHERE vehiculo_id = ? LIMIT 1', [id]);
    if (viajes.length > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar el vehículo porque tiene viajes registrados asociados.'
      });
    }

    await pool.query('DELETE FROM vehiculos WHERE id = ?', [id]);

    return res.status(200).json({
      message: `Vehículo con ID ${id} eliminado con éxito.`
    });
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    return res.status(500).json({
      error: 'Error interno al eliminar el vehículo.',
      details: error.message
    });
  }
};
