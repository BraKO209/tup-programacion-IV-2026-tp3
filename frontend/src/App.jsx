import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import PublicHome from './pages/PublicHome';
import DashboardView from './pages/DashboardView';
import VehiculosView from './pages/VehiculosView';
import ConductoresView from './pages/ConductoresView';
import ViajesView from './pages/ViajesView';
import HistorialKmView from './pages/HistorialKmView';
import { authStorage, api } from './services/api';
import './styles/main.css';

export default function App() {
  const [user, setUser] = useState(authStorage.getUser());
  const [currentView, setCurrentView] = useState(authStorage.getUser() ? 'dashboard' : 'home');

  // Modal de autenticación
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState('login');

  // Parámetros de navegación rápida a historiales
  const [historialVehiculoId, setHistorialVehiculoId] = useState(null);
  const [historialConductorId, setHistorialConductorId] = useState(null);

  // Verificar sesión activa en el montaje
  useEffect(() => {
    const checkSession = async () => {
      const token = authStorage.getToken();
      if (token) {
        try {
          const res = await api.auth.profile();
          setUser(res.usuario);
          authStorage.setUser(res.usuario);
        } catch {
          // Token inválido o expirado
          handleLogout();
        }
      }
    };
    checkSession();
  }, []);

  const handleOpenAuth = (tab = 'login') => {
    setAuthInitialTab(tab);
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = (usuario) => {
    setUser(usuario);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    setCurrentView('home');
  };

  const handleSelectVehiculoHistorial = (vehiculoId) => {
    setHistorialVehiculoId(vehiculoId);
    setHistorialConductorId(null);
    setCurrentView('historial');
  };

  const handleSelectConductorHistorial = (conductorId) => {
    setHistorialConductorId(conductorId);
    setHistorialVehiculoId(null);
    setCurrentView('historial');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={handleOpenAuth}
      />

      <main className="container" style={{ flex: 1 }}>
        {/* Vista Pública */}
        {!user && currentView === 'home' && (
          <PublicHome onOpenAuth={handleOpenAuth} />
        )}

        {/* Vistas Protegidas (Requieren Login) */}
        {user && currentView === 'dashboard' && (
          <DashboardView setCurrentView={setCurrentView} />
        )}

        {user && currentView === 'vehiculos' && (
          <VehiculosView onSelectVehiculoHistorial={handleSelectVehiculoHistorial} />
        )}

        {user && currentView === 'conductores' && (
          <ConductoresView onSelectConductorHistorial={handleSelectConductorHistorial} />
        )}

        {user && currentView === 'viajes' && (
          <ViajesView />
        )}

        {user && currentView === 'historial' && (
          <HistorialKmView
            preselectedVehiculoId={historialVehiculoId}
            preselectedConductorId={historialConductorId}
          />
        )}
      </main>

      <footer className="footer">
        <p>
          <strong>Trabajo Práctico N.° 3</strong> — Programación IV | Tecnicatura Universitaria en Programación
        </p>
        <p style={{ marginTop: '0.25rem', color: '#94a3b8' }}>
          Universidad Tecnológica Nacional - Facultad Regional La Rioja | Alumno: Federico Merlo Brac
        </p>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        initialTab={authInitialTab}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
