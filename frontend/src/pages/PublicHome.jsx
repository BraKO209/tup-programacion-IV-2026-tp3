import React from 'react';

export default function PublicHome({ onOpenAuth }) {
  return (
    <div>
      <section className="hero-section">
        <span className="hero-badge">🚀 Programación IV - UTN La Rioja</span>
        <h1 className="hero-title">Sistema de Gestión de Vehículos, Conductores y Viajes</h1>
        <p className="hero-text">
          Plataforma web integral para el control de flota, seguimiento de licencias de conductores,
          registro de viajes y cálculo automatizado de distancias y kilometraje recorrido.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => onOpenAuth('login')}>
            🔑 Iniciar Sesión
          </button>
          <button className="btn btn-secondary" onClick={() => onOpenAuth('register')}>
            📝 Registrar Usuario
          </button>
        </div>
      </section>

      <div className="features-grid">
        <div className="feature-box">
          <div className="feature-icon">🚚</div>
          <h3 className="feature-title">Control de Flota de Vehículos</h3>
          <p className="feature-desc">
            Registro detallado de unidades con marca, modelo, patente única, año de fabricación y capacidad de carga en kilogramos.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon">👨‍✈️</div>
          <h3 className="feature-title">Gestión de Conductores</h3>
          <p className="feature-desc">
            Administración de choferes con control de número de documento, licencia habilitante y monitoreo de fechas de vencimiento.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon">🛣️</div>
          <h3 className="feature-title">Asignación y Registro de Viajes</h3>
          <p className="feature-desc">
            Asociación de vehículo y conductor por cada trayecto con validación de fechas de salida, llegada, origen, destino y kilometraje.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon">📊</div>
          <h3 className="feature-title">Historial y Cálculo de Km</h3>
          <p className="feature-desc">
            Consultas inmediatas de viajes realizados por vehículo o conductor con cómputo automático de distancias totales acumuladas.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon">🔒</div>
          <h3 className="feature-title">Seguridad con JWT y Passport</h3>
          <p className="feature-desc">
            Protección de operaciones CRUD mediante JSON Web Tokens de 4 horas de validez, contraseñas encriptadas con bcrypt y control de accesos.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon">✅</div>
          <h3 className="feature-title">Validaciones de Datos</h3>
          <p className="feature-desc">
            Validación integral tanto en el frontend reactivo como en el backend con express-validator, garantizando la integridad de datos.
          </p>
        </div>
      </div>
    </div>
  );
}

