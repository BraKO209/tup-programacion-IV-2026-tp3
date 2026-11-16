import React from 'react';

export default function PublicHome({ onOpenAuth }) {
  return (
    <div>
      <section className="hero-section">
        <span className="hero-badge">UTN FR La Rioja — Programación IV</span>
        <h1 className="hero-title">Sistema de Gestión de Transporte</h1>
        <p className="hero-text">
          Aplicación para administrar los vehículos de una empresa de transporte,
          sus conductores y los viajes realizados, con cálculo de kilómetros e historial.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => onOpenAuth('login')}>
            Ingresar al Sistema
          </button>
          <button className="btn btn-secondary" onClick={() => onOpenAuth('register')}>
            Registrarse
          </button>
        </div>
      </section>

      <div className="features-grid">
        <div className="feature-box">
          <div className="feature-icon">🚚</div>
          <h3 className="feature-title">Vehículos</h3>
          <p className="feature-desc">
            Alta, edición y baja de vehículos con marca, modelo, patente única, año y capacidad de carga.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon">👨‍✈️</div>
          <h3 className="feature-title">Conductores</h3>
          <p className="feature-desc">
            Registro de choferes con datos personales, número de documento, licencia y fechas de vigencia.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon">🛣️</div>
          <h3 className="feature-title">Registro de Viajes</h3>
          <p className="feature-desc">
            Asignación de un vehículo y un conductor para cada viaje, registrando ruta, fechas y distancia.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon">📊</div>
          <h3 className="feature-title">Historial y Kilometraje</h3>
          <p className="feature-desc">
            Consulta de viajes realizados por vehículo o conductor con el cálculo total de kilómetros.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon">🔒</div>
          <h3 className="feature-title">Autenticación JWT y Passport</h3>
          <p className="feature-desc">
            Acceso seguro con tokens JWT de 4 horas de duración y contraseñas hasheadas con bcrypt.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon">✅</div>
          <h3 className="feature-title">Validación de Datos</h3>
          <p className="feature-desc">
            Validaciones en formularios y control con express-validator en todas las rutas del servidor.
          </p>
        </div>
      </div>
    </div>
  );
}
