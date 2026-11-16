import { pool } from '../config/db.js';

/**
 * Obtener todos los viajes (permite filtrar por vehiculo_id y/o conductor_id)
 */
export const getAllViajes = async (req, res) => {
  const { vehiculo_id, conductor_id } = req.query;

  try {
    let query = `
      SELECT vi.*,
             v.marca AS vehiculo_marca,
             v.modelo AS vehiculo_modelo,
             v.patente AS vehiculo_patente,
             v.capacidad_carga AS vehiculo_capacidad,
             c.nombre AS conductor_nombre,
             c.apellido AS conductor_apellido,
             c.numero_documento AS conductor_dni,
             c.numero_licencia AS conductor_licencia
      FROM viajes vi
      INNER JOIN vehiculos v ON v.id = vi.vehiculo_id
      INNER JOIN conductores c ON c.id = vi.conductor_id
      WHERE 1=1
    `;
    const params = [];

    if (vehiculo_id) {
      query += ' AND vi.vehiculo_id = ?';
      params.push(vehiculo_id);
    }

    if (conductor_id) {
      query += ' AND vi.conductor_id = ?';
      params.push(conductor_id);
    }

    query += ' ORDER BY vi.fecha_salida DESC, vi.id DESC';

    const [rows] = await pool.query(query, params);

    // Calcular el total de kilómetros del conjunto devuelto
    const totalKilometros = rows.reduce((acc, curr) => acc + Number(curr.kilometros || 0), 0);

    return res.status(200).json({
      total_registros: rows.length,
      total_kilometros: Number(totalKilometros.toFixed(2)),
      viajes: rows
    });
  } catch (error) {
    console.error('Error en getAllViajes:', error);
    return res.status(500).json({
      error: 'Error interno al consultar los viajes.',
      details: error.message
    });
  }
};

/**
 * Obtener un viaje específico por ID con datos del vehículo y conductor
 */
export const getViajeById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT vi.*,
              v.marca AS vehiculo_marca,
              v.modelo AS vehiculo_modelo,
              v.patente AS vehiculo_patente,
              v.capacidad_carga AS vehiculo_capacidad,
              c.nombre AS conductor_nombre,
              c.apellido AS conductor_apellido,
              c.numero_documento AS conductor_dni,
              c.numero_licencia AS conductor_licencia
       FROM viajes vi
       INNER JOIN vehiculos v ON v.id = vi.vehiculo_id
       INNER JOIN conductores c ON c.id = vi.conductor_id
       WHERE vi.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: `No se encontró ningún viaje con el ID ${id}.`
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error en getViajeById:', error);
    return res.status(500).json({
      error: 'Error interno al consultar el viaje.',
      details: error.message
    });
  }
};

/**
 * Crear un nuevo viaje
 */
export const createViaje = async (req, res) => {
  const {
    vehiculo_id,
    conductor_id,
    fecha_salida,
    fecha_llegada,
    origen,
    destino,
    kilometros,
    observaciones
  } = req.body;

  try {
    // 1. Verificar existencia del vehículo
    const [vehiculos] = await pool.query('SELECT id, marca, modelo, patente FROM vehiculos WHERE id = ?', [vehiculo_id]);
    if (vehiculos.length === 0) {
      return res.status(404).json({
        error: `No existe ningún vehículo registrado con el ID ${vehiculo_id}.`
      });
    }

    // 2. Verificar existencia del conductor
    const [conductores] = await pool.query('SELECT id, nombre, apellido, fecha_vencimiento_licencia FROM conductores WHERE id = ?', [conductor_id]);
    if (conductores.length === 0) {
      return res.status(404).json({
        error: `No existe ningún conductor registrado con el ID ${conductor_id}.`
      });
    }

    // Opcional: Advertencia o validación de licencia vencida
    const conductor = conductores[0];
    const fechaSalidaDate = new Date(fecha_salida);
    const vencimientoLicencia = new Date(conductor.fecha_vencimiento_licencia);
    if (vencimientoLicencia < fechaSalidaDate) {
      return res.status(400).json({
        error: `No se puede asignar el viaje: la licencia del conductor ${conductor.nombre} ${conductor.apellido} está vencida para la fecha de salida seleccionada (${conductor.fecha_vencimiento_licencia}).`
      });
    }

    // 3. Insertar el viaje
    const [result] = await pool.query(
      `INSERT INTO viajes 
       (vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vehiculo_id,
        conductor_id,
        fecha_salida,
        fecha_llegada,
        origen.trim(),
        destino.trim(),
        kilometros,
        observaciones ? observaciones.trim() : null
      ]
    );

    // Recuperar con datos completos
    const [nuevoViaje] = await pool.query(
      `SELECT vi.*,
              v.marca AS vehiculo_marca,
              v.modelo AS vehiculo_modelo,
              v.patente AS vehiculo_patente,
              c.nombre AS conductor_nombre,
              c.apellido AS conductor_apellido
       FROM viajes vi
       INNER JOIN vehiculos v ON v.id = vi.vehiculo_id
       INNER JOIN conductores c ON c.id = vi.conductor_id
       WHERE vi.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      message: 'Viaje registrado exitosamente.',
      viaje: nuevoViaje[0]
    });
  } catch (error) {
    console.error('Error en createViaje:', error);
    return res.status(500).json({
      error: 'Error interno al registrar el viaje.',
      details: error.message
    });
  }
};

/**
 * Actualizar un viaje existente
 */
export const updateViaje = async (req, res) => {
  const { id } = req.params;
  const {
    vehiculo_id,
    conductor_id,
    fecha_salida,
    fecha_llegada,
    origen,
    destino,
    kilometros,
    observaciones
  } = req.body;

  try {
    // 1. Verificar si existe el viaje
    const [viajeActual] = await pool.query('SELECT id FROM viajes WHERE id = ?', [id]);
    if (viajeActual.length === 0) {
      return res.status(404).json({
        error: `No se encontró ningún viaje con el ID ${id} para actualizar.`
      });
    }

    // 2. Verificar vehículo
    const [vehiculos] = await pool.query('SELECT id FROM vehiculos WHERE id = ?', [vehiculo_id]);
    if (vehiculos.length === 0) {
      return res.status(404).json({
        error: `No existe ningún vehículo registrado con el ID ${vehiculo_id}.`
      });
    }

    // 3. Verificar conductor
    const [conductores] = await pool.query('SELECT id, nombre, apellido, fecha_vencimiento_licencia FROM conductores WHERE id = ?', [conductor_id]);
    if (conductores.length === 0) {
      return res.status(404).json({
        error: `No existe ningún conductor registrado con el ID ${conductor_id}.`
      });
    }

    await pool.query(
      `UPDATE viajes 
       SET vehiculo_id = ?, conductor_id = ?, fecha_salida = ?, fecha_llegada = ?, 
           origen = ?, destino = ?, kilometros = ?, observaciones = ?
       WHERE id = ?`,
      [
        vehiculo_id,
        conductor_id,
        fecha_salida,
        fecha_llegada,
        origen.trim(),
        destino.trim(),
        kilometros,
        observaciones ? observaciones.trim() : null,
        id
      ]
    );

    const [actualizado] = await pool.query(
      `SELECT vi.*,
              v.marca AS vehiculo_marca,
              v.modelo AS vehiculo_modelo,
              v.patente AS vehiculo_patente,
              c.nombre AS conductor_nombre,
              c.apellido AS conductor_apellido
       FROM viajes vi
       INNER JOIN vehiculos v ON v.id = vi.vehiculo_id
       INNER JOIN conductores c ON c.id = vi.conductor_id
       WHERE vi.id = ?`,
      [id]
    );

    return res.status(200).json({
      message: 'Viaje actualizado exitosamente.',
      viaje: actualizado[0]
    });
  } catch (error) {
    console.error('Error en updateViaje:', error);
    return res.status(500).json({
      error: 'Error interno al actualizar el viaje.',
      details: error.message
    });
  }
};

/**
 * Eliminar un viaje
 */
export const deleteViaje = async (req, res) => {
  const { id } = req.params;

  try {
    const [viaje] = await pool.query('SELECT id FROM viajes WHERE id = ?', [id]);
    if (viaje.length === 0) {
      return res.status(404).json({
        error: `No se encontró ningún viaje con el ID ${id}.`
      });
    }

    await pool.query('DELETE FROM viajes WHERE id = ?', [id]);

    return res.status(200).json({
      message: `Viaje con ID ${id} eliminado exitosamente.`
    });
  } catch (error) {
    console.error('Error en deleteViaje:', error);
    return res.status(500).json({
      error: 'Error interno al eliminar el viaje.',
      details: error.message
    });
  }
};

/**
 * Consulta de historial de viajes por vehículo y cálculo total de kilómetros
 */
export const getHistorialByVehiculo = async (req, res) => {
  const { id } = req.params;

  try {
    const [vehiculos] = await pool.query('SELECT * FROM vehiculos WHERE id = ?', [id]);
    if (vehiculos.length === 0) {
      return res.status(404).json({
        error: `No se encontró ningún vehículo con el ID ${id}.`
      });
    }

    const [viajes] = await pool.query(
      `SELECT vi.*,
              c.nombre AS conductor_nombre,
              c.apellido AS conductor_apellido,
              c.numero_licencia AS conductor_licencia
       FROM viajes vi
       INNER JOIN conductores c ON c.id = vi.conductor_id
       WHERE vi.vehiculo_id = ?
       ORDER BY vi.fecha_salida DESC`,
      [id]
    );

    const totalKilometros = viajes.reduce((acc, curr) => acc + Number(curr.kilometros || 0), 0);

    return res.status(200).json({
      vehiculo: vehiculos[0],
      total_viajes: viajes.length,
      total_kilometros: Number(totalKilometros.toFixed(2)),
      historial_viajes: viajes
    });
  } catch (error) {
    console.error('Error en getHistorialByVehiculo:', error);
    return res.status(500).json({
      error: 'Error interno al consultar el historial del vehículo.',
      details: error.message
    });
  }
};

/**
 * Consulta de historial de viajes por conductor y cálculo total de kilómetros
 */
export const getHistorialByConductor = async (req, res) => {
  const { id } = req.params;

  try {
    const [conductores] = await pool.query('SELECT * FROM conductores WHERE id = ?', [id]);
    if (conductores.length === 0) {
      return res.status(404).json({
        error: `No se encontró ningún conductor con el ID ${id}.`
      });
    }

    const [viajes] = await pool.query(
      `SELECT vi.*,
              v.marca AS vehiculo_marca,
              v.modelo AS vehiculo_modelo,
              v.patente AS vehiculo_patente
       FROM viajes vi
       INNER JOIN vehiculos v ON v.id = vi.vehiculo_id
       WHERE vi.conductor_id = ?
       ORDER BY vi.fecha_salida DESC`,
      [id]
    );

    const totalKilometros = viajes.reduce((acc, curr) => acc + Number(curr.kilometros || 0), 0);

    return res.status(200).json({
      conductor: conductores[0],
      total_viajes: viajes.length,
      total_kilometros: Number(totalKilometros.toFixed(2)),
      historial_viajes: viajes
    });
  } catch (error) {
    console.error('Error en getHistorialByConductor:', error);
    return res.status(500).json({
      error: 'Error interno al consultar el historial del conductor.',
      details: error.message
    });
  }
};

/**
 * Reporte consolidado de totales de kilómetros por vehículo y conductor
 */
export const getEstadisticasKilometros = async (req, res) => {
  try {
    // Totales por vehículo
    const [porVehiculo] = await pool.query(`
      SELECT v.id, v.marca, v.modelo, v.patente,
             COUNT(vi.id) AS total_viajes,
             COALESCE(SUM(vi.kilometros), 0) AS total_kilometros
      FROM vehiculos v
      LEFT JOIN viajes vi ON vi.vehiculo_id = v.id
      GROUP BY v.id
      ORDER BY total_kilometros DESC
    `);

    // Totales por conductor
    const [porConductor] = await pool.query(`
      SELECT c.id, c.nombre, c.apellido, c.numero_documento, c.numero_licencia,
             COUNT(vi.id) AS total_viajes,
             COALESCE(SUM(vi.kilometros), 0) AS total_kilometros
      FROM conductores c
      LEFT JOIN viajes vi ON vi.conductor_id = c.id
      GROUP BY c.id
      ORDER BY total_kilometros DESC
    `);

    // Total general de kilómetros
    const [general] = await pool.query(`
      SELECT COUNT(id) AS total_viajes,
             COALESCE(SUM(kilometros), 0) AS total_kilometros_empresa
      FROM viajes
    `);

    return res.status(200).json({
      total_general: general[0],
      kilometros_por_vehiculo: porVehiculo,
      kilometros_por_conductor: porConductor
    });
  } catch (error) {
    console.error('Error en getEstadisticasKilometros:', error);
    return res.status(500).json({
      error: 'Error al generar las estadísticas de kilómetros.',
      details: error.message
    });
  }
};
