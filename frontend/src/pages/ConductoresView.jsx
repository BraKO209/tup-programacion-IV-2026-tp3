import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function ConductoresView({ onSelectConductorHistorial }) {
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Estado Modal Alta / Modificación
  const [modalOpen, setModalOpen] = useState(false);
  const [editingConductor, setEditingConductor] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    numero_documento: '',
    numero_licencia: '',
    fecha_alta_licencia: '',
    fecha_vencimiento_licencia: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Filtro
  const [filtro, setFiltro] = useState('');

  const cargarConductores = async () => {
    setLoading(true);
    try {
      const data = await api.conductores.getAll();
      setConductores(data);
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message || 'Error al cargar conductores.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarConductores();
  }, []);

  const abrirModalCrear = () => {
    setEditingConductor(null);
    setFormData({
      nombre: '',
      apellido: '',
      numero_documento: '',
      numero_licencia: '',
      fecha_alta_licencia: '',
      fecha_vencimiento_licencia: ''
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const formatearFechaInput = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  };

  const abrirModalEditar = (c) => {
    setEditingConductor(c);
    setFormData({
      nombre: c.nombre,
      apellido: c.apellido,
      numero_documento: c.numero_documento,
      numero_licencia: c.numero_licencia,
      fecha_alta_licencia: formatearFechaInput(c.fecha_alta_licencia),
      fecha_vencimiento_licencia: formatearFechaInput(c.fecha_vencimiento_licencia)
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setEditingConductor(null);
    setFormErrors({});
  };

  const validarFormulario = () => {
    const errs = {};

    if (!formData.nombre.trim() || formData.nombre.trim().length < 2) {
      errs.nombre = 'El nombre es obligatorio (mínimo 2 letras).';
    }

    if (!formData.apellido.trim() || formData.apellido.trim().length < 2) {
      errs.apellido = 'El apellido es obligatorio (mínimo 2 letras).';
    }

    if (!formData.numero_documento.trim() || formData.numero_documento.trim().length < 6) {
      errs.numero_documento = 'El número de documento es obligatorio (mínimo 6 dígitos).';
    }

    if (!formData.numero_licencia.trim()) {
      errs.numero_licencia = 'El número de licencia es obligatorio.';
    }

    if (!formData.fecha_alta_licencia) {
      errs.fecha_alta_licencia = 'La fecha de alta es obligatoria.';
    }

    if (!formData.fecha_vencimiento_licencia) {
      errs.fecha_vencimiento_licencia = 'La fecha de vencimiento es obligatoria.';
    } else if (formData.fecha_alta_licencia && formData.fecha_vencimiento_licencia <= formData.fecha_alta_licencia) {
      errs.fecha_vencimiento_licencia = 'La fecha de vencimiento debe ser posterior a la fecha de alta.';
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
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      numero_documento: formData.numero_documento.trim(),
      numero_licencia: formData.numero_licencia.trim(),
      fecha_alta_licencia: formData.fecha_alta_licencia,
      fecha_vencimiento_licencia: formData.fecha_vencimiento_licencia
    };

    try {
      if (editingConductor) {
        await api.conductores.update(editingConductor.id, payload);
        setMensaje({ tipo: 'success', texto: 'Conductor actualizado exitosamente.' });
      } else {
        await api.conductores.create(payload);
        setMensaje({ tipo: 'success', texto: 'Conductor registrado exitosamente.' });
      }
      cerrarModal();
      await cargarConductores();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message || 'Error al guardar el conductor.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminar = async (id, nombreCompleto) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar al conductor ${nombreCompleto}?`)) {
      return;
    }

    try {
      await api.conductores.delete(id);
      setMensaje({ tipo: 'success', texto: `Conductor ${nombreCompleto} eliminado exitosamente.` });
      await cargarConductores();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message || 'Error al eliminar el conductor.' });
    }
  };

  const conductoresFiltrados = conductores.filter((c) => {
    const texto = `${c.nombre} ${c.apellido} ${c.numero_documento} ${c.numero_licencia}`.toLowerCase();
    return texto.includes(filtro.toLowerCase());
  });

  const esLicenciaVigente = (fechaVenc) => {
    if (!fechaVenc) return false;
    return new Date(fechaVenc) >= new Date();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestión de Conductores</h1>
          <p className="page-description">
            Control de chóferes, números de documento, habilitación de licencias y vigencia.
          </p>
        </div>
        <button className="btn btn-primary" onClick={abrirModalCrear}>
          ➕ Nuevo Conductor
        </button>
      </div>

      {mensaje.texto && (
        <div className={`alert alert-${mensaje.tipo}`}>
          <span>{mensaje.tipo === 'success' ? '✅' : '⚠️'} {mensaje.texto}</span>
          <button className="alert-close" onClick={() => setMensaje({ tipo: '', texto: '' })}>&times;</button>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="filter-item" style={{ maxWidth: '350px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Buscar por nombre, apellido, DNI o licencia..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Total: <strong>{conductoresFiltrados.length}</strong> de {conductores.length} conductores
          </span>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando conductores...</div>
          ) : conductoresFiltrados.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👨‍✈️</div>
              <div className="empty-state-title">No se encontraron conductores</div>
              <p>No hay conductores que coincidan con la búsqueda o aún no ha registrado ninguno.</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }} onClick={abrirModalCrear}>
                Registrar Primer Conductor
              </button>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre y Apellido</th>
                  <th>N° Documento</th>
                  <th>N° Licencia</th>
                  <th>Vencimiento Licencia</th>
                  <th>Estado</th>
                  <th>Viajes</th>
                  <th>Km Totales</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {conductoresFiltrados.map((c) => {
                  const vigente = esLicenciaVigente(c.fecha_vencimiento_licencia);
                  return (
                    <tr key={c.id}>
                      <td>#{c.id}</td>
                      <td>
                        <strong>{c.nombre} {c.apellido}</strong>
                      </td>
                      <td>{c.numero_documento}</td>
                      <td>
                        <code>{c.numero_licencia}</code>
                      </td>
                      <td>
                        {new Date(c.fecha_vencimiento_licencia).toLocaleDateString('es-AR')}
                      </td>
                      <td>
                        <span className={`badge ${vigente ? 'badge-success' : 'badge-danger'}`}>
                          {vigente ? 'Vigente' : 'Vencida'}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-blue">{c.total_viajes || 0}</span>
                      </td>
                      <td>
                        <strong>{Number(c.total_kilometros || 0).toLocaleString('es-AR')} km</strong>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          className="btn btn-sm btn-secondary"
                          style={{ marginRight: '6px' }}
                          title="Ver historial de viajes y km"
                          onClick={() => onSelectConductorHistorial(c.id)}
                        >
                          📈 Historial
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          style={{ marginRight: '6px' }}
                          title="Modificar conductor"
                          onClick={() => abrirModalEditar(c)}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          title="Eliminar conductor"
                          onClick={() => handleEliminar(c.id, `${c.nombre} ${c.apellido}`)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Formulario para Alta / Modificación */}
      {modalOpen && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingConductor ? `✏️ Modificar Conductor #${editingConductor.id}` : '👨‍✈️ Registrar Nuevo Conductor'}
              </h3>
              <button className="modal-close" onClick={cerrarModal}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      Nombre <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.nombre ? 'is-invalid' : ''}`}
                      placeholder="Ej: Carlos"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                    {formErrors.nombre && <span className="form-error">{formErrors.nombre}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Apellido <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.apellido ? 'is-invalid' : ''}`}
                      placeholder="Ej: González"
                      value={formData.apellido}
                      onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    />
                    {formErrors.apellido && <span className="form-error">{formErrors.apellido}</span>}
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      Número de Documento (DNI) <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.numero_documento ? 'is-invalid' : ''}`}
                      placeholder="Ej: 32456789"
                      value={formData.numero_documento}
                      onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
                    />
                    {formErrors.numero_documento && <span className="form-error">{formErrors.numero_documento}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Número de Licencia de Conducir <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.numero_licencia ? 'is-invalid' : ''}`}
                      placeholder="Ej: LIC-AR-00129"
                      value={formData.numero_licencia}
                      onChange={(e) => setFormData({ ...formData, numero_licencia: e.target.value })}
                    />
                    {formErrors.numero_licencia && <span className="form-error">{formErrors.numero_licencia}</span>}
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      Fecha de Alta de Licencia <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      className={`form-control ${formErrors.fecha_alta_licencia ? 'is-invalid' : ''}`}
                      value={formData.fecha_alta_licencia}
                      onChange={(e) => setFormData({ ...formData, fecha_alta_licencia: e.target.value })}
                    />
                    {formErrors.fecha_alta_licencia && <span className="form-error">{formErrors.fecha_alta_licencia}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Fecha de Vencimiento de Licencia <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      className={`form-control ${formErrors.fecha_vencimiento_licencia ? 'is-invalid' : ''}`}
                      value={formData.fecha_vencimiento_licencia}
                      onChange={(e) => setFormData({ ...formData, fecha_vencimiento_licencia: e.target.value })}
                    />
                    {formErrors.fecha_vencimiento_licencia && <span className="form-error">{formErrors.fecha_vencimiento_licencia}</span>}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={cerrarModal} disabled={submitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : (editingConductor ? 'Guardar Cambios' : 'Registrar Conductor')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
