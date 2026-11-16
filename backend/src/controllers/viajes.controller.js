import { pool } from '../config/db.js';

// Listar viajes (con filtro opcional por vehículo o conductor)
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

    // Sumar el total de kilómetros
    const totalKilometros = rows.reduce((acc, curr) => acc + Number(curr.kilometros || 0), 0);

    return res.status(200).json({
      total_registros: rows.length,
      total_kilometros: Number(totalKilometros.toFixed(2)),
      viajes: rows
    });
  } catch (error) {
    console.error('Error al listar viajes:', error);
    return res.status(500).json({
      error: 'Error interno del servidor al consultar viajes.',
      details: error.message
    });
  }
};

// Obtener un viaje por ID
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
    console.error('Error al obtener viaje:', error);
    return res.status(500).json({
      error: 'Error interno al consultar el viaje.',
      details: error.message
    });
  }
};

// Crear un nuevo viaje
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
    // 1. Verificar vehículo
    const [vehiculos] = await pool.query('SELECT id FROM vehiculos WHERE id = ?', [vehiculo_id]);
    if (vehiculos.length === 0) {
      return res.status(404).json({
        error: `No existe el vehículo con ID ${vehiculo_id}.`
      });
    }

    // 2. Verificar conductor
    const [conductores] = await pool.query('SELECT id, nombre, apellido, fecha_vencimiento_licencia FROM conductores WHERE id = ?', [conductor_id]);
    if (conductores.length === 0) {
      return res.status(404).json({
        error: `No existe el conductor con ID ${conductor_id}.`
      });
    }

    // Comprobar vigencia de la licencia
    const conductor = conductores[0];
    if (new Date(conductor.fecha_vencimiento_licencia) < new Date(fecha_salida)) {
      return res.status(400).json({
        error: `La licencia del conductor ${conductor.nombre} ${conductor.apellido} está vencida para la fecha de salida.`
      });
    }

    // 3. Insertar viaje
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

    const [nuevo] = await pool.query(
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
      message: 'Viaje registrado con éxito.',
      viaje: nuevo[0]
    });
  } catch (error) {
    console.error('Error al registrar viaje:', error);
    return res.status(500).json({
      error: 'Error interno al guardar el viaje.',
      details: error.message
    });
  }
};

// Modificar un viaje
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
    const [actual] = await pool.query('SELECT id FROM viajes WHERE id = ?', [id]);
    if (actual.length === 0) {
      return res.status(404).json({
        error: `No se encontró ningún viaje con el ID ${id}.`
      });
    }

    // Validar existencia de vehículo y conductor
    const [vehiculos] = await pool.query('SELECT id FROM vehiculos WHERE id = ?', [vehiculo_id]);
    if (vehiculos.length === 0) {
      return res.status(404).json({ error: `No existe el vehículo con ID ${vehiculo_id}.` });
    }

    const [conductores] = await pool.query('SELECT id FROM conductores WHERE id = ?', [conductor_id]);
    if (conductores.length === 0) {
      return res.status(404).json({ error: `No existe el conductor con ID ${conductor_id}.` });
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
      message: 'Viaje actualizado con éxito.',
      viaje: actualizado[0]
    });
  } catch (error) {
    console.error('Error al actualizar viaje:', error);
    return res.status(500).json({
      error: 'Error interno al actualizar el viaje.',
      details: error.message
    });
  }
};

// Eliminar un viaje
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
      message: `Viaje con ID ${id} eliminado con éxito.`
    });
  } catch (error) {
    console.error('Error al eliminar viaje:', error);
    return res.status(500).json({
      error: 'Error interno al eliminar el viaje.',
      details: error.message
    });
  }
};

// Historial de viajes por vehículo y cálculo total de km
export const getHistorialByVehiculo = async (req, res) => {
  const { id } = req.params;

  try {
    const [vehiculos] = await pool.query('SELECT * FROM vehiculos WHERE id = ?', [id]);
    if (vehiculos.length === 0) {
      return res.status(404).json({
        error: `No se encontró el vehículo con ID ${id}.`
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
    console.error('Error al consultar historial del vehículo:', error);
    return res.status(500).json({
      error: 'Error interno al consultar el historial del vehículo.',
      details: error.message
    });
  }
};

// Historial de viajes por conductor y cálculo total de km
export const getHistorialByConductor = async (req, res) => {
  const { id } = req.params;

  try {
    const [conductores] = await pool.query('SELECT * FROM conductores WHERE id = ?', [id]);
    if (conductores.length === 0) {
      return res.status(404).json({
        error: `No se encontró el conductor con ID ${id}.`
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
    console.error('Error al consultar historial del conductor:', error);
    return res.status(500).json({
      error: 'Error interno al consultar el historial del conductor.',
      details: error.message
    });
  }
};

// Estadísticas de kilómetros por vehículo y conductor
export const getEstadisticasKilometros = async (req, res) => {
  try {
    const [porVehiculo] = await pool.query(`
      SELECT v.id, v.marca, v.modelo, v.patente,
             COUNT(vi.id) AS total_viajes,
             COALESCE(SUM(vi.kilometros), 0) AS total_kilometros
      FROM vehiculos v
      LEFT JOIN viajes vi ON vi.vehiculo_id = v.id
      GROUP BY v.id
      ORDER BY total_kilometros DESC
    `);

    const [porConductor] = await pool.query(`
      SELECT c.id, c.nombre, c.apellido, c.numero_documento, c.numero_licencia,
             COUNT(vi.id) AS total_viajes,
             COALESCE(SUM(vi.kilometros), 0) AS total_kilometros
      FROM conductores c
      LEFT JOIN viajes vi ON vi.conductor_id = c.id
      GROUP BY c.id
      ORDER BY total_kilometros DESC
    `);

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
    console.error('Error en estadísticas de kilómetros:', error);
    return res.status(500).json({
      error: 'Error interno al generar estadísticas de kilómetros.',
      details: error.message
    });
  }
};
