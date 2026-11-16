import React from 'react';

export default function Navbar({ currentView, setCurrentView, user, onLogout, onOpenAuth }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => setCurrentView(user ? 'dashboard' : 'home')}>
        <span className="navbar-logo">🚛</span>
        <div>
          <span className="navbar-title">Gestión de Transporte</span>
          <span className="navbar-subtitle">UTN FR La Rioja • Programación IV</span>
        </div>
      </div>

      <div className="navbar-nav">
        {!user ? (
          <>
            <button
              className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentView('home')}
            >
              🏠 Inicio
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => onOpenAuth('login')}>
              🔑 Iniciar Sesión / Registro
            </button>
          </>
        ) : (
          <>
            <button
              className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('dashboard')}
            >
              📊 Resumen
            </button>
            <button
              className={`nav-link ${currentView === 'vehiculos' ? 'active' : ''}`}
              onClick={() => setCurrentView('vehiculos')}
            >
              🚚 Vehículos
            </button>
            <button
              className={`nav-link ${currentView === 'conductores' ? 'active' : ''}`}
              onClick={() => setCurrentView('conductores')}
            >
              👨‍✈️ Conductores
            </button>
            <button
              className={`nav-link ${currentView === 'viajes' ? 'active' : ''}`}
              onClick={() => setCurrentView('viajes')}
            >
              🛣️ Viajes
            </button>
            <button
              className={`nav-link ${currentView === 'historial' ? 'active' : ''}`}
              onClick={() => setCurrentView('historial')}
            >
              📈 Historial & Km
            </button>

            <div className="nav-user-badge">
              <span className="user-avatar-mini">{user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}</span>
              <span>{user.nombre}</span>
            </div>

            <button className="btn-logout" onClick={onLogout} title="Cerrar Sesión">
              Cerrar Sesión
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

