import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function DashboardView({ setCurrentView }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [viajesRecientes, setViajesRecientes] = useState([]);
  const [error, setError] = useState('');

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const [resStats, resViajes] = await Promise.all([
        api.viajes.getEstadisticas(),
        api.viajes.getAll()
      ]);
      setStats(resStats);
      setViajesRecientes(resViajes.viajes ? resViajes.viajes.slice(0, 5) : []);
    } catch (err) {
      setError(err.message || 'Error al cargar los datos del resumen.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  if (loading) {
    return (
      <div className="card card-body" style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Cargando información del sistema...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <span>⚠️ {error}</span>
        <button className="btn btn-sm btn-secondary" onClick={cargarDatos}>Reintentar</button>
      </div>
    );
  }

  const totalKm = stats?.total_general?.total_kilometros_empresa || 0;
  const totalViajes = stats?.total_general?.total_viajes || 0;
  const totalVehiculos = stats?.kilometros_por_vehiculo?.length || 0;
  const totalConductores = stats?.kilometros_por_conductor?.length || 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Panel de Control General</h1>
          <p className="page-description">
            Resumen en tiempo real del estado de la flota, conductores activos y kilómetros recorridos.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary" onClick={() => setCurrentView('viajes')}>
            ➕ Nuevo Viaje
          </button>
          <button className="btn btn-secondary" onClick={() => setCurrentView('historial')}>
            📈 Ver Historial y Km
          </button>
        </div>
      </div>

      {/* Grilla de Métricas Principales */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-blue">🚚</div>
          <div>
            <div className="stat-value">{totalVehiculos}</div>
            <div className="stat-label">Vehículos en Flota</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-green">👨‍✈️</div>
          <div>
            <div className="stat-value">{totalConductores}</div>
            <div className="stat-label">Conductores Registrados</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-purple">🛣️</div>
          <div>
            <div className="stat-value">{totalViajes}</div>
            <div className="stat-label">Viajes Realizados</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-orange">📍</div>
          <div>
            <div className="stat-value">{Number(totalKm).toLocaleString('es-AR')} km</div>
            <div className="stat-label">Total Kilómetros Recorridos</div>
          </div>
        </div>
      </div>

      {/* Tabla de Últimos Viajes */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>🛣️ Últimos Viajes Registrados</h3>
          <button className="btn btn-sm btn-secondary" onClick={() => setCurrentView('viajes')}>
            Ver Todos los Viajes &rarr;
          </button>
        </div>
        <div className="table-responsive">
          {viajesRecientes.length === 0 ? (
            <div className="empty-state">
              <p>No hay viajes registrados aún en el sistema.</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha Salida</th>
                  <th>Vehículo</th>
                  <th>Conductor</th>
                  <th>Trayecto</th>
                  <th>Distancia</th>
                </tr>
              </thead>
              <tbody>
                {viajesRecientes.map((viaje) => (
                  <tr key={viaje.id}>
                    <td>{new Date(viaje.fecha_salida).toLocaleDateString('es-AR')}</td>
                    <td>
                      <strong>{viaje.vehiculo_marca} {viaje.vehiculo_modelo}</strong>
                      <span className="badge badge-gray" style={{ marginLeft: '6px' }}>{viaje.vehiculo_patente}</span>
                    </td>
                    <td>{viaje.conductor_nombre} {viaje.conductor_apellido}</td>
                    <td>{viaje.origen} &rarr; {viaje.destino}</td>
                    <td>
                      <span className="badge badge-blue">{viaje.kilometros} km</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
