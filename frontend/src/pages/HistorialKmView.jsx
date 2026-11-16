import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function HistorialKmView({ preselectedVehiculoId = null, preselectedConductorId = null }) {
  const [subTab, setSubTab] = useState(
    preselectedConductorId ? 'conductor' : (preselectedVehiculoId ? 'vehiculo' : 'ranking')
  );

  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [selectedVehiculoId, setSelectedVehiculoId] = useState(preselectedVehiculoId || '');
  const [selectedConductorId, setSelectedConductorId] = useState(preselectedConductorId || '');

  const [vehiculoData, setVehiculoData] = useState(null);
  const [conductorData, setConductorData] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar listas iniciales y estadísticas generales
  useEffect(() => {
    const init = async () => {
      try {
        const [resVehiculos, resConductores, resStats] = await Promise.all([
          api.vehiculos.getAll(),
          api.conductores.getAll(),
          api.viajes.getEstadisticas()
        ]);
        setVehiculos(resVehiculos);
        setConductores(resConductores);
        setEstadisticas(resStats);

        if (!selectedVehiculoId && resVehiculos.length > 0) {
          setSelectedVehiculoId(resVehiculos[0].id);
        }
        if (!selectedConductorId && resConductores.length > 0) {
          setSelectedConductorId(resConductores[0].id);
        }
      } catch (err) {
        setError(err.message || 'Error al cargar los datos.');
      }
    };
    init();
  }, []);

  // Cargar historial cuando cambia el vehículo seleccionado
  useEffect(() => {
    if (subTab === 'vehiculo' && selectedVehiculoId) {
      cargarHistorialVehiculo(selectedVehiculoId);
    }
  }, [subTab, selectedVehiculoId]);

  // Cargar historial cuando cambia el conductor seleccionado
  useEffect(() => {
    if (subTab === 'conductor' && selectedConductorId) {
      cargarHistorialConductor(selectedConductorId);
    }
  }, [subTab, selectedConductorId]);

  const cargarHistorialVehiculo = async (id) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.viajes.getHistorialVehiculo(id);
      setVehiculoData(data);
    } catch (err) {
      setError(err.message || 'Error al cargar el historial del vehículo.');
    } finally {
      setLoading(false);
    }
  };

  const cargarHistorialConductor = async (id) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.viajes.getHistorialConductor(id);
      setConductorData(data);
    } catch (err) {
      setError(err.message || 'Error al cargar el historial del conductor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Historial de Viajes y Kilómetros</h1>
          <p className="page-description">
            Consulta los viajes realizados por cada vehículo o conductor y el cálculo total de kilómetros.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Selector de Pestañas de Consulta */}
      <div className="auth-tabs" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`auth-tab ${subTab === 'vehiculo' ? 'active' : ''}`}
          onClick={() => setSubTab('vehiculo')}
        >
          🚚 Historial por Vehículo
        </button>
        <button
          className={`auth-tab ${subTab === 'conductor' ? 'active' : ''}`}
          onClick={() => setSubTab('conductor')}
        >
          👨‍✈️ Historial por Conductor
        </button>
        <button
          className={`auth-tab ${subTab === 'ranking' ? 'active' : ''}`}
          onClick={() => setSubTab('ranking')}
        >
          📊 Totales y Estadísticas Consolidadas
        </button>
      </div>

      {/* ========================================================
          1. PESTAÑA: HISTORIAL POR VEHÍCULO
         ======================================================== */}
      {subTab === 'vehiculo' && (
        <div>
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div className="card-body" style={{ padding: '1rem' }}>
              <div className="form-group" style={{ maxWidth: '450px', marginBottom: 0 }}>
                <label className="form-label">Seleccione el Vehículo a Consultar:</label>
                <select
                  className="form-control"
                  value={selectedVehiculoId}
                  onChange={(e) => setSelectedVehiculoId(e.target.value)}
                >
                  {vehiculos.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.marca} {v.modelo} - Patente: {v.patente} ({v.anio})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando historial del vehículo...</div>
          ) : vehiculoData ? (
            <div>
              {/* Tarjetas resumen del vehículo */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon icon-blue">🚚</div>
                  <div>
                    <div className="stat-value" style={{ fontSize: '1.2rem' }}>
                      {vehiculoData.vehiculo.marca} {vehiculoData.vehiculo.modelo}
                    </div>
                    <div className="stat-label">
                      Patente: <strong>{vehiculoData.vehiculo.patente}</strong> | Año: {vehiculoData.vehiculo.anio}
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon icon-purple">🛣️</div>
                  <div>
                    <div className="stat-value">{vehiculoData.total_viajes}</div>
                    <div className="stat-label">Viajes Realizados</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon icon-orange">📍</div>
                  <div>
                    <div className="stat-value" style={{ color: '#c2410c' }}>
                      {Number(vehiculoData.total_kilometros).toLocaleString('es-AR')} km
                    </div>
                    <div className="stat-label">Total Kilómetros Recorridos</div>
                  </div>
                </div>
              </div>

              {/* Detalle de viajes de este vehículo */}
              <div className="card">
                <div className="card-header">
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                    Historial de Viajes del Vehículo {vehiculoData.vehiculo.patente}
                  </h3>
                </div>
                <div className="table-responsive">
                  {vehiculoData.historial_viajes.length === 0 ? (
                    <div className="empty-state">
                      <p>Este vehículo aún no posee viajes registrados en el sistema.</p>
                    </div>
                  ) : (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Fecha y Hora</th>
                          <th>Conductor Asignado</th>
                          <th>Ruta (Origen &rarr; Destino)</th>
                          <th>Kilómetros</th>
                          <th>Observaciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vehiculoData.historial_viajes.map((viaje) => (
                          <tr key={viaje.id}>
                            <td>#{viaje.id}</td>
                            <td>
                              <div>{new Date(viaje.fecha_salida).toLocaleDateString('es-AR')}</div>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                Llegada: {new Date(viaje.fecha_llegada).toLocaleDateString('es-AR')}
                              </span>
                            </td>
                            <td>
                              <strong>{viaje.conductor_nombre} {viaje.conductor_apellido}</strong>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Lic: {viaje.conductor_licencia}</div>
                            </td>
                            <td>
                              <strong>{viaje.origen}</strong> &rarr; <strong>{viaje.destino}</strong>
                            </td>
                            <td>
                              <span className="badge badge-blue">
                                {Number(viaje.kilometros).toLocaleString('es-AR')} km
                              </span>
                            </td>
                            <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                              {viaje.observaciones || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ========================================================
          2. PESTAÑA: HISTORIAL POR CONDUCTOR
         ======================================================== */}
      {subTab === 'conductor' && (
        <div>
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div className="card-body" style={{ padding: '1rem' }}>
              <div className="form-group" style={{ maxWidth: '450px', marginBottom: 0 }}>
                <label className="form-label">Seleccione el Conductor a Consultar:</label>
                <select
                  className="form-control"
                  value={selectedConductorId}
                  onChange={(e) => setSelectedConductorId(e.target.value)}
                >
                  {conductores.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} {c.apellido} - DNI: {c.numero_documento} (Lic: {c.numero_licencia})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando historial del conductor...</div>
          ) : conductorData ? (
            <div>
              {/* Tarjetas resumen del conductor */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon icon-green">👨‍✈️</div>
                  <div>
                    <div className="stat-value" style={{ fontSize: '1.2rem' }}>
                      {conductorData.conductor.nombre} {conductorData.conductor.apellido}
                    </div>
                    <div className="stat-label">
                      DNI: <strong>{conductorData.conductor.numero_documento}</strong> | Lic: {conductorData.conductor.numero_licencia}
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon icon-purple">🛣️</div>
                  <div>
                    <div className="stat-value">{conductorData.total_viajes}</div>
                    <div className="stat-label">Viajes Realizados</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon icon-orange">📍</div>
                  <div>
                    <div className="stat-value" style={{ color: '#c2410c' }}>
                      {Number(conductorData.total_kilometros).toLocaleString('es-AR')} km
                    </div>
                    <div className="stat-label">Total Kilómetros Recorridos</div>
                  </div>
                </div>
              </div>

              {/* Detalle de viajes de este conductor */}
              <div className="card">
                <div className="card-header">
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                    Historial de Viajes de {conductorData.conductor.nombre} {conductorData.conductor.apellido}
                  </h3>
                </div>
                <div className="table-responsive">
                  {conductorData.historial_viajes.length === 0 ? (
                    <div className="empty-state">
                      <p>Este conductor aún no tiene viajes asignados en el sistema.</p>
                    </div>
                  ) : (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Fecha y Hora</th>
                          <th>Vehículo Conducido</th>
                          <th>Ruta (Origen &rarr; Destino)</th>
                          <th>Kilómetros</th>
                          <th>Observaciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {conductorData.historial_viajes.map((viaje) => (
                          <tr key={viaje.id}>
                            <td>#{viaje.id}</td>
                            <td>
                              <div>{new Date(viaje.fecha_salida).toLocaleDateString('es-AR')}</div>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                Llegada: {new Date(viaje.fecha_llegada).toLocaleDateString('es-AR')}
                              </span>
                            </td>
                            <td>
                              <strong>{viaje.vehiculo_marca} {viaje.vehiculo_modelo}</strong>
                              <div><span className="badge badge-gray">{viaje.vehiculo_patente}</span></div>
                            </td>
                            <td>
                              <strong>{viaje.origen}</strong> &rarr; <strong>{viaje.destino}</strong>
                            </td>
                            <td>
                              <span className="badge badge-blue">
                                {Number(viaje.kilometros).toLocaleString('es-AR')} km
                              </span>
                            </td>
                            <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                              {viaje.observaciones || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ========================================================
          3. PESTAÑA: TOTALES Y RANKING CONSOLIDADO
         ======================================================== */}
      {subTab === 'ranking' && estadisticas && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem', background: '#f8fafc' }}>
            <div className="card-body" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <span className="badge badge-blue" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Total Acumulado de la Empresa
              </span>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a' }}>
                {Number(estadisticas.total_general.total_kilometros_empresa).toLocaleString('es-AR')} km
              </div>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Registrados a lo largo de {estadisticas.total_general.total_viajes} viajes completados.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
            {/* Tabla Kilómetros por Vehículo */}
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>🚚 Kilómetros por Vehículo</h3>
              </div>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Vehículo</th>
                      <th>Patente</th>
                      <th>Viajes</th>
                      <th>Total Km</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estadisticas.kilometros_por_vehiculo.map((v) => (
                      <tr key={v.id}>
                        <td><strong>{v.marca}</strong> {v.modelo}</td>
                        <td><span className="badge badge-gray">{v.patente}</span></td>
                        <td>{v.total_viajes}</td>
                        <td><strong>{Number(v.total_kilometros).toLocaleString('es-AR')} km</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabla Kilómetros por Conductor */}
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>👨‍✈️ Kilómetros por Conductor</h3>
              </div>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Conductor</th>
                      <th>DNI</th>
                      <th>Viajes</th>
                      <th>Total Km</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estadisticas.kilometros_por_conductor.map((c) => (
                      <tr key={c.id}>
                        <td><strong>{c.nombre} {c.apellido}</strong></td>
                        <td>{c.numero_documento}</td>
                        <td>{c.total_viajes}</td>
                        <td><strong>{Number(c.total_kilometros).toLocaleString('es-AR')} km</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

