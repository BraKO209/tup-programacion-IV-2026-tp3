import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from './config/passport.js';
import { initDatabase } from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import vehiculosRoutes from './routes/vehiculos.routes.js';
import conductoresRoutes from './routes/conductores.routes.js';
import viajesRoutes from './routes/viajes.routes.js';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Ruta de bienvenida / estado de la API
app.get('/', (req, res) => {
  return res.json({
    proyecto: 'Trabajo Práctico N.° 3 - Programación IV',
    institucion: 'UTN - Facultad Regional La Rioja',
    autor: 'Federico Merlo Brac',
    sistema: 'API de Gestión de Vehículos, Conductores y Viajes',
    estado: 'Servicio en línea',
    endpoints: {
      auth: {
        registro: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        perfil: 'GET /api/auth/profile (requiere JWT)'
      },
      vehiculos: {
        listar: 'GET /api/vehiculos',
        obtenerPorId: 'GET /api/vehiculos/:id',
        crear: 'POST /api/vehiculos',
        actualizar: 'PUT /api/vehiculos/:id',
        eliminar: 'DELETE /api/vehiculos/:id'
      },
      conductores: {
        listar: 'GET /api/conductores',
        obtenerPorId: 'GET /api/conductores/:id',
        crear: 'POST /api/conductores',
        actualizar: 'PUT /api/conductores/:id',
        eliminar: 'DELETE /api/conductores/:id'
      },
      viajes: {
        listar: 'GET /api/viajes (soporta ?vehiculo_id y ?conductor_id)',
        obtenerPorId: 'GET /api/viajes/:id',
        crear: 'POST /api/viajes',
        actualizar: 'PUT /api/viajes/:id',
        eliminar: 'DELETE /api/viajes/:id',
        historialPorVehiculo: 'GET /api/viajes/historial/vehiculo/:id',
        historialPorConductor: 'GET /api/viajes/historial/conductor/:id',
        estadisticasKilometros: 'GET /api/viajes/estadisticas/kilometros'
      }
    }
  });
});

// Montaje de rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/vehiculos', vehiculosRoutes);
app.use('/api/conductores', conductoresRoutes);
app.use('/api/viajes', viajesRoutes);

// Manejo de rutas inexistentes (404)
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada.',
    metodo: req.method,
    url: req.originalUrl
  });
});

// Manejador centralizado de errores no capturados (500)
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({
    error: 'Error interno del servidor (500).',
    message: err.message || 'Ocurrió un error inesperado.'
  });
});

// Inicialización de la base de datos y arranque del servidor
if (process.env.NODE_ENV !== 'test') {
  initDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Servidor backend escuchando en http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('No se pudo iniciar el servidor debido a error en la base de datos:', err);
    });
}
