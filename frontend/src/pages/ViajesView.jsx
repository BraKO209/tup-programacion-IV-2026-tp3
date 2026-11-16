import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function ViajesView({ initialVehiculoId = null, initialConductorId = null }) {
  const [viajes, setViajes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalKilometros, setTotalKilometros] = useState(0);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Filtros
  const [filtroVehiculo, setFiltroVehiculo] = useState(initialVehiculoId || '');
  const [filtroConductor, setFiltroConductor] = useState(initialConductorId || '');

  // Modal Alta / Edición
  const [modalOpen, setModalOpen] = useState(false);
  const [editingViaje, setEditingViaje] = useState(null);
  const [formData, setFormData] = useState({
    vehiculo_id: '',
    conductor_id: '',
    fecha_salida: '',
    fecha_llegada: '',
    origen: '',
    destino: '',
    kilometros: '',
    observaciones: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Cargar lista de vehículos y conductores para los selectores
  const cargarOpciones = async () => {
    try {
      const [resVehiculos, resConductores] = await Promise.all([
        api.vehiculos.getAll(),
        api.conductores.getAll()
      ]);
      setVehiculos(resVehiculos);
      setConductores(resConductores);
    } catch (err) {
      console.error('Error al cargar opciones:', err);
    }
  };

  const cargarViajes = async () => {
    setLoading(true);
    try {
      const res = await api.viajes.getAll({
        vehiculo_id: filtroVehiculo || undefined,
        conductor_id: filtroConductor || undefined
      });
      setViajes(res.viajes || []);
      setTotalKilometros(res.total_kilometros || 0);
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message || 'Error al consultar los viajes.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarOpciones();
  }, []);

  useEffect(() => {
    cargarViajes();
  }, [filtroVehiculo, filtroConductor]);

  const formatearFechaHoraInput = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const abrirModalCrear = () => {
    setEditingViaje(null);
    const ahora = new Date();
    const salidaDefault = formatearFechaHoraInput(ahora);
    ahora.setHours(ahora.getHours() + 4);
    const llegadaDefault = formatearFechaHoraInput(ahora);

    setFormData({
      vehiculo_id: vehiculos.length > 0 ? String(vehiculos[0].id) : '',
      conductor_id: conductores.length > 0 ? String(conductores[0].id) : '',
      fecha_salida: salidaDefault,
      fecha_llegada: llegadaDefault,
      origen: '',
      destino: '',
      kilometros: '',
      observaciones: ''
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const abrirModalEditar = (viaje) => {
    setEditingViaje(viaje);
    setFormData({
      vehiculo_id: String(viaje.vehiculo_id),
      conductor_id: String(viaje.conductor_id),
      fecha_salida: formatearFechaHoraInput(viaje.fecha_salida),
      fecha_llegada: formatearFechaHoraInput(viaje.fecha_llegada),
      origen: viaje.origen,
      destino: viaje.destino,
      kilometros: viaje.kilometros,
      observaciones: viaje.observaciones || ''
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setEditingViaje(null);
    setFormErrors({});
  };

  const validarFormulario = () => {
    const errs = {};

    if (!formData.vehiculo_id) {
      errs.vehiculo_id = 'Debe seleccionar un vehículo para el viaje.';
    }

    if (!formData.conductor_id) {
      errs.conductor_id = 'Debe seleccionar un conductor habilitado.';
    }

    if (!formData.fecha_salida) {
      errs.fecha_salida = 'La fecha y hora de salida son obligatorias.';
    }

    if (!formData.fecha_llegada) {
      errs.fecha_llegada = 'La fecha y hora de llegada son obligatorias.';
    } else if (formData.fecha_salida && new Date(formData.fecha_llegada) < new Date(formData.fecha_salida)) {
      errs.fecha_llegada = 'La fecha de llegada no puede ser anterior a la salida.';
    }

    if (!formData.origen.trim() || formData.origen.trim().length < 2) {
      errs.origen = 'El origen es obligatorio (mínimo 2 caracteres).';
    }

    if (!formData.destino.trim() || formData.destino.trim().length < 2) {
      errs.destino = 'El destino es obligatorio (mínimo 2 caracteres).';
    }

    const km = parseFloat(formData.kilometros);
    if (isNaN(km) || km <= 0) {
      errs.kilometros = 'Los kilómetros deben ser un número mayor a 0.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setSubmitting(true);
    setMensaje({ tipo: '', texto: '' });

    const payload = {
      vehiculo_id: parseInt(formData.vehiculo_id, 10),
      conductor_id: parseInt(formData.conductor_id, 10),
      fecha_salida: formData.fecha_salida,
      fecha_llegada: formData.fecha_llegada,
      origen: formData.origen.trim(),
      destino: formData.destino.trim(),
      kilometros: parseFloat(formData.kilometros),
      observaciones: formData.observaciones.trim() || null
    };

    try {
      if (editingViaje) {
        await api.viajes.update(editingViaje.id, payload);
        setMensaje({ tipo: 'success', texto: 'Viaje actualizado exitosamente.' });
      } else {
        await api.viajes.create(payload);
        setMensaje({ tipo: 'success', texto: 'Viaje registrado exitosamente.' });
      }
      cerrarModal();
      await cargarViajes();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message || 'Error al guardar el viaje.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar el viaje #${id}?`)) {
      return;
    }

    try {
      await api.viajes.delete(id);
      setMensaje({ tipo: 'success', texto: `Viaje #${id} eliminado correctamente.` });
      await cargarViajes();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message || 'Error al eliminar el viaje.' });
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestión y Registro de Viajes</h1>
          <p className="page-description">
            Asignación de unidades y conductores, seguimiento de trayectos y cálculo de kilómetros.
          </p>
        </div>
        <button className="btn btn-primary" onClick={abrirModalCrear}>
          ➕ Registrar Nuevo Viaje
        </button>
      </div>

      {mensaje.texto && (
        <div className={`alert alert-${mensaje.tipo}`}>
          <span>{mensaje.tipo === 'success' ? '✅' : '⚠️'} {mensaje.texto}</span>
          <button className="alert-close" onClick={() => setMensaje({ tipo: '', texto: '' })}>&times;</button>
        </div>
      )}

      {/* Barra de Filtros por Vehículo y Conductor */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-body" style={{ padding: '1rem' }}>
          <div className="filter-bar">
            <div className="filter-item">
              <label className="form-label" style={{ marginBottom: '4px' }}>Filtrar por Vehículo:</label>
              <select
                className="form-control"
                value={filtroVehiculo}
                onChange={(e) => setFiltroVehiculo(e.target.value)}
              >
                <option value="">-- Todos los vehículos --</option>
                {vehiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.marca} {v.modelo} ({v.patente})
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label className="form-label" style={{ marginBottom: '4px' }}>Filtrar por Conductor:</label>
              <select
                className="form-control"
                value={filtroConductor}
                onChange={(e) => setFiltroConductor(e.target.value)}
              >
                <option value="">-- Todos los conductores --</option>
                {conductores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.apellido} (DNI: {c.numero_documento})
                  </option>
                ))}
              </select>
            </div>

            {(filtroVehiculo || filtroConductor) && (
              <div style={{ alignSelf: 'flex-end', marginBottom: '4px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setFiltroVehiculo(''); setFiltroConductor(''); }}
                >
                  Limpiar Filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resumen de Kilómetros del filtro actual */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card" style={{ padding: '0.85rem 1.25rem' }}>
          <div className="stat-icon icon-purple" style={{ width: '40px', height: '40px', fontSize: '1.25rem' }}>🛣️</div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.25rem' }}>{viajes.length}</div>
            <div className="stat-label">Viajes Mostrados</div>
          </div>
        </div>

        <div className="stat-card" style={{ padding: '0.85rem 1.25rem' }}>
          <div className="stat-icon icon-orange" style={{ width: '40px', height: '40px', fontSize: '1.25rem' }}>📍</div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.25rem' }}>{Number(totalKilometros).toLocaleString('es-AR')} km</div>
            <div className="stat-label">Cálculo Total Kilómetros</div>
          </div>
        </div>
      </div>

      {/* Tabla de Viajes */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>📋 Listado Detallado de Viajes</h3>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando viajes...</div>
          ) : viajes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🛣️</div>
              <div className="empty-state-title">No hay viajes registrados</div>
              <p>No se encontraron viajes con los filtros seleccionados.</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }} onClick={abrirModalCrear}>
                Registrar Primer Viaje
              </button>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fechas (Salida / Llegada)</th>
                  <th>Vehículo Asignado</th>
                  <th>Conductor Asignado</th>
                  <th>Ruta (Origen &rarr; Destino)</th>
                  <th>Distancia</th>
                  <th>Observaciones</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {viajes.map((viaje) => (
                  <tr key={viaje.id}>
                    <td>#{viaje.id}</td>
                    <td>
                      <div><strong>Salida:</strong> {new Date(viaje.fecha_salida).toLocaleString('es-AR')}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        <strong>Llegada:</strong> {new Date(viaje.fecha_llegada).toLocaleString('es-AR')}
                      </div>
                    </td>
                    <td>
                      <div><strong>{viaje.vehiculo_marca} {viaje.vehiculo_modelo}</strong></div>
                      <span className="badge badge-gray">{viaje.vehiculo_patente}</span>
                    </td>
                    <td>
                      <div><strong>{viaje.conductor_nombre} {viaje.conductor_apellido}</strong></div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Lic: {viaje.conductor_licencia}</span>
                    </td>
                    <td>
                      <strong>{viaje.origen}</strong>
                      <div style={{ color: '#64748b', fontSize: '0.85rem' }}>&darr; hacia</div>
                      <strong>{viaje.destino}</strong>
                    </td>
                    <td>
                      <span className="badge badge-blue" style={{ fontSize: '0.85rem' }}>
                        {Number(viaje.kilometros).toLocaleString('es-AR')} km
                      </span>
                    </td>
                    <td style={{ maxWidth: '200px', fontSize: '0.8rem', color: '#475569' }}>
                      {viaje.observaciones || '—'}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        className="btn btn-sm btn-secondary"
                        style={{ marginRight: '6px' }}
                        title="Modificar viaje"
                        onClick={() => abrirModalEditar(viaje)}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        title="Eliminar viaje"
                        onClick={() => handleEliminar(viaje.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Formulario para Registro / Edición de Viaje */}
      {modalOpen && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingViaje ? `✏️ Modificar Viaje #${editingViaje.id}` : '🛣️ Registrar Nuevo Viaje'}
              </h3>
              <button className="modal-close" onClick={cerrarModal}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      Vehículo Asignado <span className="required">*</span>
                    </label>
                    <select
                      className={`form-control ${formErrors.vehiculo_id ? 'is-invalid' : ''}`}
                      value={formData.vehiculo_id}
                      onChange={(e) => setFormData({ ...formData, vehiculo_id: e.target.value })}
                    >
                      <option value="">-- Seleccionar Vehículo --</option>
                      {vehiculos.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.marca} {v.modelo} (Patente: {v.patente})
                        </option>
                      ))}
                    </select>
                    {formErrors.vehiculo_id && <span className="form-error">{formErrors.vehiculo_id}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Conductor Asignado <span className="required">*</span>
                    </label>
                    <select
                      className={`form-control ${formErrors.conductor_id ? 'is-invalid' : ''}`}
                      value={formData.conductor_id}
                      onChange={(e) => setFormData({ ...formData, conductor_id: e.target.value })}
                    >
                      <option value="">-- Seleccionar Conductor --</option>
                      {conductores.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre} {c.apellido} (Lic: {c.numero_licencia})
                        </option>
                      ))}
                    </select>
                    {formErrors.conductor_id && <span className="form-error">{formErrors.conductor_id}</span>}
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      Fecha y Hora de Salida <span className="required">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      className={`form-control ${formErrors.fecha_salida ? 'is-invalid' : ''}`}
                      value={formData.fecha_salida}
                      onChange={(e) => setFormData({ ...formData, fecha_salida: e.target.value })}
                    />
                    {formErrors.fecha_salida && <span className="form-error">{formErrors.fecha_salida}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Fecha y Hora de Llegada <span className="required">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      className={`form-control ${formErrors.fecha_llegada ? 'is-invalid' : ''}`}
                      value={formData.fecha_llegada}
                      onChange={(e) => setFormData({ ...formData, fecha_llegada: e.target.value })}
                    />
                    {formErrors.fecha_llegada && <span className="form-error">{formErrors.fecha_llegada}</span>}
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      Ciudad / Lugar de Origen <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.origen ? 'is-invalid' : ''}`}
                      placeholder="Ej: La Rioja (Capital)"
                      value={formData.origen}
                      onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                    />
                    {formErrors.origen && <span className="form-error">{formErrors.origen}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Ciudad / Lugar de Destino <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.destino ? 'is-invalid' : ''}`}
                      placeholder="Ej: Córdoba (Centro)"
                      value={formData.destino}
                      onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                    />
                    {formErrors.destino && <span className="form-error">{formErrors.destino}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Distancia en Kilómetros <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className={`form-control ${formErrors.kilometros ? 'is-invalid' : ''}`}
                    placeholder="Ej: 440.50"
                    value={formData.kilometros}
                    onChange={(e) => setFormData({ ...formData, kilometros: e.target.value })}
                  />
                  {formErrors.kilometros && <span className="form-error">{formErrors.kilometros}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Observaciones (Opcional)</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    placeholder="Detalles de la carga, ruta tomada, paradas intermedias, etc."
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={cerrarModal} disabled={submitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : (editingViaje ? 'Guardar Cambios' : 'Registrar Viaje')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
