import React, { useState } from 'react';
import { api } from '../services/api';

export default function AuthModal({ isOpen, initialTab = 'login', onClose, onLoginSuccess }) {
  const [tab, setTab] = useState(initialTab); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [serverSuccess, setServerSuccess] = useState('');

  // Estados de formularios
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Errores de validación cliente
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setServerSuccess('');
    const errs = {};

    if (!loginData.email.trim()) {
      errs.email = 'El correo electrónico es obligatorio.';
    } else if (!validateEmail(loginData.email)) {
      errs.email = 'Ingrese un formato de correo válido (ej: usuario@correo.com).';
    }

    if (!loginData.password) {
      errs.password = 'La contraseña es obligatoria.';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await api.auth.login(loginData.email.trim(), loginData.password);
      onLoginSuccess(res.usuario);
      onClose();
    } catch (err) {
      setServerError(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setServerSuccess('');
    const errs = {};

    if (!registerData.nombre.trim() || registerData.nombre.trim().length < 2) {
      errs.nombre = 'El nombre debe contener al menos 2 caracteres.';
    }

    if (!registerData.email.trim()) {
      errs.email = 'El correo electrónico es obligatorio.';
    } else if (!validateEmail(registerData.email)) {
      errs.email = 'Ingrese un formato de correo electrónico válido.';
    }

    if (!registerData.password) {
      errs.password = 'La contraseña es obligatoria.';
    } else if (registerData.password.length < 6) {
      errs.password = 'La contraseña debe tener un mínimo de 6 caracteres.';
    }

    if (registerData.password !== registerData.confirmPassword) {
      errs.confirmPassword = 'Las contraseñas no coinciden.';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await api.auth.register(
        registerData.nombre.trim(),
        registerData.email.trim(),
        registerData.password
      );
      setServerSuccess('¡Registro exitoso! Ya puedes iniciar sesión con tu cuenta.');
      setLoginData({ email: registerData.email, password: '' });
      setTab('login');
    } catch (err) {
      setServerError(err.message || 'Error al registrar el usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <h3 className="modal-title">
            {tab === 'login' ? '🔑 Iniciar Sesión' : '📝 Crear Nueva Cuenta'}
          </h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {/* Selector de pestañas */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => { setTab('login'); setErrors({}); setServerError(''); }}
            >
              Iniciar Sesión
            </button>
            <button
              className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
              onClick={() => { setTab('register'); setErrors({}); setServerError(''); }}
            >
              Registrarse
            </button>
          </div>

          {serverError && (
            <div className="alert alert-danger">
              <span>⚠️ {serverError}</span>
            </div>
          )}

          {serverSuccess && (
            <div className="alert alert-success">
              <span>✅ {serverSuccess}</span>
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">
                  Correo Electrónico <span className="required">*</span>
                </label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="ejemplo@transporte.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Contraseña <span className="required">*</span>
                </label>
                <input
                  type="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                />
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
                </button>
              </div>

              <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                💡 Usuario Demo: <strong>admin@transporte.com</strong> / <strong>Admin1234!</strong>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label className="form-label">
                  Nombre Completo <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                  placeholder="Juan Pérez"
                  value={registerData.nombre}
                  onChange={(e) => setRegisterData({ ...registerData, nombre: e.target.value })}
                />
                {errors.nombre && <span className="form-error">{errors.nombre}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Correo Electrónico <span className="required">*</span>
                </label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="juan@transporte.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Contraseña <span className="required">*</span>
                </label>
                <input
                  type="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Mínimo 6 caracteres"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                />
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Confirmar Contraseña <span className="required">*</span>
                </label>
                <input
                  type="password"
                  className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  placeholder="Repita la contraseña"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                />
                {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Registrando cuenta...' : 'Crear Cuenta'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

