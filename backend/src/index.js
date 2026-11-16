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
  const esNavegador = req.headers.accept && req.headers.accept.includes('text/html') && !req.headers.accept.includes('application/json');

  if (esNavegador) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>API Backend - Programación IV</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 40px; background: #0f172a; color: #f8fafc; max-width: 800px; margin: 0 auto; text-align: center; }
          .card { background: #1e293b; padding: 30px; border-radius: 12px; border: 1px solid #334155; margin-top: 20px; text-align: left; }
          h1 { color: #38bdf8; margin-bottom: 10px; }
          .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 15px; font-size: 1.1rem; }
          .btn:hover { background: #1d4ed8; }
          .badge { background: #0284c7; padding: 4px 10px; border-radius: 99px; font-size: 0.8rem; }
          code { background: #090d16; padding: 2px 6px; border-radius: 4px; color: #38bdf8; }
        </style>
      </head>
      <body>
        <h1>🚛 Backend API de Gestión de Transporte</h1>
        <p>Trabajo Práctico N.° 3 — Programación IV (UTN FR La Rioja)</p>
        <div class="card">
          <p><strong>ℹ️ Estás viendo el servidor BACKEND (puerto 3000):</strong></p>
          <p>El backend es la API REST que responde datos en formato JSON para el frontend.</p>
          <p>Para ver e interactuar con la <strong>aplicación visual (React + CSS)</strong>, debes ingresar al puerto <strong>5173</strong>:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a class="btn" href="http://localhost:5173" target="_self">👉 Abrir Interfaz Frontend (http://localhost:5173)</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #334155; margin: 20px 0;" />
          <p style="font-size: 0.9rem; color: #94a3b8;">
            Para ver la respuesta JSON pura de la API, consulta este endpoint con el encabezado <code>Accept: application/json</code> o prueba los endpoints con el archivo <code>api.http</code>.
          </p>
        </div>
      </body>
      </html>
    `);
  }

  return res.json({
    proyecto: 'Trabajo Práctico N.° 3 - Programación IV',
    institucion: 'UTN - Facultad Regional La Rioja',
    autor: 'Federico Merlo Brac',
    sistema: 'API de Gestión de Vehículos, Conductores y Viajes',
    estado: 'Servicio en línea',
    frontend_url: 'http://localhost:5173',
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
