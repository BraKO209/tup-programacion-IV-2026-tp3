import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function VehiculosView({ onSelectVehiculoHistorial }) {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Estado para Modal de Alta / Modificación
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState(null);
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    patente: '',
    anio: new Date().getFullYear(),
    capacidad_carga: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Filtro de búsqueda
  const [filtro, setFiltro] = useState('');

  const cargarVehiculos = async () => {
    setLoading(true);
    try {
      const data = await api.vehiculos.getAll();
      setVehiculos(data);
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message || 'Error al cargar los vehículos.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVehiculos();
  }, []);

  const abrirModalCrear = () => {
    setEditingVehiculo(null);
    setFormData({
      marca: '',
      modelo: '',
      patente: '',
      anio: new Date().getFullYear(),
      capacidad_carga: ''
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const abrirModalEditar = (v) => {
    setEditingVehiculo(v);
    setFormData({
      marca: v.marca,
      modelo: v.modelo,
      patente: v.patente,
      anio: v.anio,
      capacidad_carga: v.capacidad_carga
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setEditingVehiculo(null);
    setFormErrors({});
  };

  // Validaciones en el cliente
  const validarFormulario = () => {
    const errs = {};
    const anioActual = new Date().getFullYear();

    if (!formData.marca.trim() || formData.marca.trim().length < 2) {
      errs.marca = 'La marca es obligatoria y debe tener al menos 2 caracteres.';
    }

    if (!formData.modelo.trim()) {
      errs.modelo = 'El modelo es obligatorio.';
    }

    if (!formData.patente.trim()) {
      errs.patente = 'La patente es obligatoria.';
    } else if (formData.patente.trim().length < 6 || formData.patente.trim().length > 10) {
      errs.patente = 'La patente debe tener entre 6 y 10 caracteres (ej: AE123CD).';
    }

    const anioNum = parseInt(formData.anio, 10);
    if (isNaN(anioNum) || anioNum < 1950 || anioNum > anioActual + 1) {
      errs.anio = `El año debe ser válido (entre 1950 y ${anioActual + 1}).`;
    }

    const cargaNum = parseFloat(formData.capacidad_carga);
    if (isNaN(cargaNum) || cargaNum <= 0) {
      errs.capacidad_carga = 'La capacidad de carga debe ser un valor numérico mayor a 0 kg.';
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
      marca: formData.marca.trim(),
      modelo: formData.modelo.trim(),
      patente: formData.patente.trim().toUpperCase(),
      anio: parseInt(formData.anio, 10),
      capacidad_carga: parseFloat(formData.capacidad_carga)
    };

    try {
      if (editingVehiculo) {
        await api.vehiculos.update(editingVehiculo.id, payload);
        setMensaje({ tipo: 'success', texto: 'Vehículo actualizado correctamente.' });
      } else {
        await api.vehiculos.create(payload);
        setMensaje({ tipo: 'success', texto: 'Vehículo registrado correctamente.' });
      }
      cerrarModal();
      await cargarVehiculos();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message || 'Error al guardar el vehículo.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminar = async (id, patente) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar el vehículo con patente "${patente}"?`)) {
      return;
    }

    try {
      await api.vehiculos.delete(id);
      setMensaje({ tipo: 'success', texto: `Vehículo ${patente} eliminado con éxito.` });
      await cargarVehiculos();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message || 'Error al eliminar el vehículo.' });
    }
  };

  const vehiculosFiltrados = vehiculos.filter((v) => {
    const texto = `${v.marca} ${v.modelo} ${v.patente} ${v.anio}`.toLowerCase();
    return texto.includes(filtro.toLowerCase());
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestión de Vehículos</h1>
          <p className="page-description">
            Administración del parque automotor, control de patentes y capacidades de carga.
          </p>
        </div>
        <button className="btn btn-primary" onClick={abrirModalCrear}>
          ➕ Nuevo Vehículo
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
              placeholder="🔍 Buscar por marca, modelo o patente..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Total: <strong>{vehiculosFiltrados.length}</strong> de {vehiculos.length} vehículos
          </span>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando vehículos...</div>
          ) : vehiculosFiltrados.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🚚</div>
              <div className="empty-state-title">No se encontraron vehículos</div>
              <p>No hay registros coincidentes con el criterio de búsqueda o aún no ha registrado vehículos.</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }} onClick={abrirModalCrear}>
                Registrar Primer Vehículo
              </button>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Marca y Modelo</th>
                  <th>Patente</th>
                  <th>Año</th>
                  <th>Capacidad Carga</th>
                  <th>Viajes</th>
                  <th>Km Totales</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vehiculosFiltrados.map((v) => (
                  <tr key={v.id}>
                    <td>#{v.id}</td>
                    <td>
                      <strong>{v.marca}</strong> {v.modelo}
                    </td>
                    <td>
                      <span className="badge badge-gray">{v.patente}</span>
                    </td>
                    <td>{v.anio}</td>
                    <td>{Number(v.capacidad_carga).toLocaleString('es-AR')} kg</td>
                    <td>
                      <span className="badge badge-blue">{v.total_viajes || 0}</span>
                    </td>
                    <td>
                      <strong>{Number(v.total_kilometros || 0).toLocaleString('es-AR')} km</strong>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        className="btn btn-sm btn-secondary"
                        style={{ marginRight: '6px' }}
                        title="Ver historial de viajes y km"
                        onClick={() => onSelectVehiculoHistorial(v.id)}
                      >
                        📈 Historial
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        style={{ marginRight: '6px' }}
                        title="Modificar vehículo"
                        onClick={() => abrirModalEditar(v)}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        title="Eliminar vehículo"
                        onClick={() => handleEliminar(v.id, v.patente)}
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

      {/* Modal Formulario para Alta / Modificación */}
      {modalOpen && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingVehiculo ? `✏️ Modificar Vehículo #${editingVehiculo.id}` : '🚚 Registrar Nuevo Vehículo'}
              </h3>
              <button className="modal-close" onClick={cerrarModal}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      Marca <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.marca ? 'is-invalid' : ''}`}
                      placeholder="Ej: Mercedes-Benz, Scania, Iveco"
                      value={formData.marca}
                      onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    />
                    {formErrors.marca && <span className="form-error">{formErrors.marca}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Modelo <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.modelo ? 'is-invalid' : ''}`}
                      placeholder="Ej: Actros 2645, FH 460"
                      value={formData.modelo}
                      onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    />
                    {formErrors.modelo && <span className="form-error">{formErrors.modelo}</span>}
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      Patente <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formErrors.patente ? 'is-invalid' : ''}`}
                      placeholder="Ej: AE123CD o AB123CD"
                      value={formData.patente}
                      onChange={(e) => setFormData({ ...formData, patente: e.target.value.toUpperCase() })}
                    />
                    {formErrors.patente && <span className="form-error">{formErrors.patente}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Año de Fabricación <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      className={`form-control ${formErrors.anio ? 'is-invalid' : ''}`}
                      placeholder="Ej: 2023"
                      min="1950"
                      max={new Date().getFullYear() + 1}
                      value={formData.anio}
                      onChange={(e) => setFormData({ ...formData, anio: e.target.value })}
                    />
                    {formErrors.anio && <span className="form-error">{formErrors.anio}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Capacidad de Carga (kg) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className={`form-control ${formErrors.capacidad_carga ? 'is-invalid' : ''}`}
                    placeholder="Ej: 25000"
                    value={formData.capacidad_carga}
                    onChange={(e) => setFormData({ ...formData, capacidad_carga: e.target.value })}
                  />
                  {formErrors.capacidad_carga && <span className="form-error">{formErrors.capacidad_carga}</span>}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={cerrarModal} disabled={submitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : (editingVehiculo ? 'Guardar Cambios' : 'Registrar Vehículo')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

