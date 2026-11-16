# Trabajo Práctico N.° 3 - Programación IV
## Universidad Tecnológica Nacional - Facultad Regional La Rioja
### Tecnicatura Universitaria en Programación

**Sistema de Gestión de Vehículos, Conductores y Viajes**

---

## 📌 Descripción del Proyecto
Aplicación web integral (Backend API REST + Frontend SPA) para registrar y gestionar los vehículos de una empresa de transporte, sus conductores y los viajes realizados, incluyendo control de kilometraje e historial.

---

## 🛠 Tecnologías Utilizadas

### Backend
- **Node.js** con **Express.js** (módulos ES6).
- **MySQL** como base de datos relacional (conector `mysql2`).
- **Autenticación:** JWT (JSON Web Tokens) con expiración de 4 horas.
- **Autorización:** Estrategia Passport JWT (`passport`, `passport-jwt`).
- **Seguridad:** Hash de contraseñas con `bcryptjs`.
- **Validaciones:** `express-validator` en todas las rutas de obtención, creación y actualización.
- **Pruebas:** Archivo `api.http` para pruebas directas de la API.

### Frontend
- **React** (JavaScript) sobre **Vite**.
- **CSS puro** (sin frameworks ni librerías de componentes).
- Comunicación con el Backend mediante `fetch`.
- Validaciones en formularios del lado del cliente.

---

## 📁 Estructura del Proyecto
```text
tp3 prog4/
├── backend/
│   ├── src/
│   │   ├── config/          # Conexión DB y configuración de Passport JWT
│   │   ├── controllers/     # Controladores de la API (Auth, Vehículos, Conductores, Viajes)
│   │   ├── middlewares/     # Middlewares de validación y autenticación
│   │   ├── routes/          # Rutas de la API REST
│   │   ├── validators/      # Reglas de validación con express-validator
│   │   └── index.js         # Entrada del servidor Express
│   ├── api.http             # Archivo para pruebas HTTP
│   ├── schema.sql           # Definición de tablas y base de datos MySQL
│   ├── .env.example         # Ejemplo de variables de entorno
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/      # Componentes reutilizables (Navbar, Modales, Tablas, etc.)
│   │   ├── pages/           # Vistas (Inicio público, Login, Vehículos, Conductores, Viajes)
│   │   ├── services/        # Servicios de consumo de la API mediante fetch
│   │   ├── styles/          # Estilos en CSS puro
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .gitignore
└── README.md
```
