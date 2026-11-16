import { pool } from '../config/db.js';

/**
 * Obtener todos los conductores
 */
export const getAllConductores = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*,
              COUNT(vi.id) AS total_viajes,
              COALESCE(SUM(vi.kilometros), 0) AS total_kilometros
       FROM conductores c
       LEFT JOIN viajes vi ON vi.conductor_id = c.id
       GROUP BY c.id
       ORDER BY c.id DESC`
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error en getAllConductores:', error);
    return res.status(500).json({
      error: 'Error interno al consultar los conductores.',
      details: error.message
    });
  }
};

/**
 * Obtener un conductor por ID
 */
export const getConductorById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT c.*,
              COUNT(vi.id) AS total_viajes,
              COALESCE(SUM(vi.kilometros), 0) AS total_kilometros
       FROM conductores c
       LEFT JOIN viajes vi ON vi.conductor_id = c.id
       WHERE c.id = ?
       GROUP BY c.id`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: `No se encontró ningún conductor con el ID ${id}.`
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error en getConductorById:', error);
    return res.status(500).json({
      error: 'Error interno al consultar el conductor.',
      details: error.message
    });
  }
};

/**
 * Crear un nuevo conductor
 */
export const createConductor = async (req, res) => {
  const {
    nombre,
    apellido,
    numero_documento,
    numero_licencia,
    fecha_alta_licencia,
    fecha_vencimiento_licencia
  } = req.body;

  try {
    // Comprobar si el documento ya existe
    const [dniExistente] = await pool.query(
      'SELECT id FROM conductores WHERE numero_documento = ?',
      [numero_documento.trim()]
    );
    if (dniExistente.length > 0) {
      return res.status(400).json({
        error: `El número de documento "${numero_documento}" ya está registrado.`
      });
    }

    // Comprobar si la licencia ya existe
    const [licenciaExistente] = await pool.query(
      'SELECT id FROM conductores WHERE numero_licencia = ?',
      [numero_licencia.trim()]
    );
    if (licenciaExistente.length > 0) {
      return res.status(400).json({
        error: `El número de licencia "${numero_licencia}" ya está registrado.`
      });
    }

    const [result] = await pool.query(
      `INSERT INTO conductores 
       (nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nombre.trim(),
        apellido.trim(),
        numero_documento.trim(),
        numero_licencia.trim(),
        fecha_alta_licencia,
        fecha_vencimiento_licencia
      ]
    );

    const [nuevo] = await pool.query('SELECT * FROM conductores WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      message: 'Conductor registrado exitosamente.',
      conductor: nuevo[0]
    });
  } catch (error) {
    console.error('Error en createConductor:', error);
    return res.status(500).json({
      error: 'Error interno al registrar el conductor.',
      details: error.message
    });
  }
};

/**
 * Actualizar un conductor existente
 */
export const updateConductor = async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    apellido,
    numero_documento,
    numero_licencia,
    fecha_alta_licencia,
    fecha_vencimiento_licencia
  } = req.body;

  try {
    // Verificar si existe el conductor
    const [conductorActual] = await pool.query('SELECT id FROM conductores WHERE id = ?', [id]);
    if (conductorActual.length === 0) {
      return res.status(404).json({
        error: `No se encontró ningún conductor con el ID ${id} para actualizar.`
      });
    }

    // Verificar si el documento está en uso por otro conductor
    const [dniExistente] = await pool.query(
      'SELECT id FROM conductores WHERE numero_documento = ? AND id != ?',
      [numero_documento.trim(), id]
    );
    if (dniExistente.length > 0) {
      return res.status(400).json({
        error: `El número de documento "${numero_documento}" ya está en uso por otro conductor.`
      });
    }

    // Verificar si la licencia está en uso por otro conductor
    const [licenciaExistente] = await pool.query(
      'SELECT id FROM conductores WHERE numero_licencia = ? AND id != ?',
      [numero_licencia.trim(), id]
    );
    if (licenciaExistente.length > 0) {
      return res.status(400).json({
        error: `El número de licencia "${numero_licencia}" ya está en uso por otro conductor.`
      });
    }

    await pool.query(
      `UPDATE conductores 
       SET nombre = ?, apellido = ?, numero_documento = ?, numero_licencia = ?, 
           fecha_alta_licencia = ?, fecha_vencimiento_licencia = ? 
       WHERE id = ?`,
      [
        nombre.trim(),
        apellido.trim(),
        numero_documento.trim(),
        numero_licencia.trim(),
        fecha_alta_licencia,
        fecha_vencimiento_licencia,
        id
      ]
    );

    const [actualizado] = await pool.query('SELECT * FROM conductores WHERE id = ?', [id]);

    return res.status(200).json({
      message: 'Conductor actualizado correctamente.',
      conductor: actualizado[0]
    });
  } catch (error) {
    console.error('Error en updateConductor:', error);
    return res.status(500).json({
      error: 'Error interno al actualizar el conductor.',
      details: error.message
    });
  }
};

/**
 * Eliminar un conductor
 */
export const deleteConductor = async (req, res) => {
  const { id } = req.params;

  try {
    const [conductor] = await pool.query('SELECT * FROM conductores WHERE id = ?', [id]);
    if (conductor.length === 0) {
      return res.status(404).json({
        error: `No se encontró ningún conductor con el ID ${id}.`
      });
    }

    // Verificar si tiene viajes asociados
    const [viajes] = await pool.query('SELECT id FROM viajes WHERE conductor_id = ? LIMIT 1', [id]);
    if (viajes.length > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar el conductor porque posee viajes asociados en el sistema.'
      });
    }

    await pool.query('DELETE FROM conductores WHERE id = ?', [id]);

    return res.status(200).json({
      message: `Conductor con ID ${id} (${conductor[0].nombre} ${conductor[0].apellido} - DNI ${conductor[0].numero_documento}) eliminado correctamente.`
    });
  } catch (error) {
    console.error('Error en deleteConductor:', error);
    return res.status(500).json({
      error: 'Error interno al eliminar el conductor.',
      details: error.message
    });
  }
};
