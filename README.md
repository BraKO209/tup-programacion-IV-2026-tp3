# Trabajo Práctico N.° 3 — Programación IV
## Universidad Tecnológica Nacional - Facultad Regional La Rioja
### Tecnicatura Universitaria en Programación

**Sistema de Gestión de Vehículos, Conductores y Viajes**  
**Alumno:** Federico Merlo Brac

---

## 🌐 URLs de Acceso Rápido

> [!IMPORTANT]
> **Diferencia entre Frontend y Backend al abrir en el navegador:**
> - 💻 **Frontend (Interfaz Gráfica de Usuario):** [http://localhost:5173](http://localhost:5173)  
>   *(Aquí está la aplicación web interactiva con la pantalla principal, formularios de vehículos y conductores, registro de viajes, tablas y cálculo de kilómetros).*
> - ⚙️ **Backend (API REST JSON):** [http://localhost:3000](http://localhost:3000)  
>   *(Es el servidor que procesa los datos y devuelve respuestas en JSON para las peticiones de la aplicación).*

---

## 📋 Descripción del Proyecto

Aplicación web integral (Backend API REST + Frontend Single Page Application) desarrollada según las especificaciones del Trabajo Práctico N.° 3 de Programación IV. Permite gestionar la flota de vehículos de una empresa de transporte, sus conductores habilitados, la asignación de viajes y el cómputo automático de distancias e historial de kilometraje.

---

## 🚀 Requerimientos Técnicos Cumplidos

### Frontend
- **Framework:** Vite + React (JavaScript moderno).
- **Página principal pública:** Presentación del sistema y accesos directos.
- **Página de inicio de sesión y registro:** Modal interactivo con alternancia entre login y registro.
- **Comunicación con el backend:** Consumo de la API REST mediante la API nativa `fetch` en formato JSON.
- **Validaciones en el frontend:** Validación de campos obligatorios, formatos de correo, longitudes, números positivos y consistencia de fechas (vencimiento de licencias, fechas de llegada posteriores a la salida).
- **Diseño visual:** Implementado en **CSS puro** (sin Bootstrap, Tailwind ni librerías externas), con diseño responsivo, modales, tablas estilizadas, tarjetas y badges de estado.
- **Vistas y Módulos:**
  - Listado de vehículos con métricas asociadas.
  - Listado de conductores con monitoreo de vigencia de licencias.
  - Carga y visualización de viajes asociando vehículo y conductor.
  - Formularios para alta, modificación y eliminación de vehículos, conductores y viajes.
  - Historial detallado por vehículo o por conductor.
  - Cálculo total de kilómetros recorridos por unidad, chofer y general de la empresa.

### Backend
- **Framework:** Node.js con Express.js (arquitectura modular ESM).
- **Base de Datos:** MySQL con conector `mysql2/promise` y script de inicialización automática de esquema y datos semilla.
- **Validaciones de Datos:** `express-validator` aplicado en todas las rutas de obtención (IDs y filtros), creación y actualización de recursos.
- **Manejo de Errores:** Respuestas con códigos de estado HTTP semánticos:
  - `200 OK`: Consultas y actualizaciones exitosas.
  - `201 Created`: Registros y creaciones exitosas.
  - `400 Bad Request`: Errores de validación de datos o reglas de negocio duplicadas.
  - `401 Unauthorized`: Acceso no autenticado, token ausente, expirado o credenciales inválidas.
  - `404 Not Found`: Recursos no encontrados por identificador.
  - `500 Internal Server Error`: Fallos no controlados del servidor.
- **Autenticación y Autorización:**
  - Registro e inicio de sesión con JWT (`jsonwebtoken`).
  - Restricción de rutas protegidas mediante middleware de Passport (`passport-jwt`).
  - Todas las operaciones CRUD están protegidas y exigen autenticación.
- **Seguridad:**
  - Contraseñas almacenadas de forma segura con hash `bcrypt` (10 rounds).
  - Nunca se transmiten contraseñas en texto plano ni se devuelven hashes en las respuestas.
  - Los tokens JWT poseen un tiempo de expiración estricto de **4 horas** (`expiresIn: '4h'`).
- **Pruebas y Documentación:**
  - Archivo `backend/api.http` con peticiones listas para REST Client / Thunder Client.
  - Archivo `backend/schema.sql` con el DDL completo de base de datos, relaciones y claves foráneas.
  - Suite de pruebas automatizadas en `backend/test-api.mjs`.

---

## 📁 Estructura del Repositorio

```text
tp3 prog4/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # Conexión MySQL pool e inicializador de tablas
│   │   │   └── passport.js           # Estrategia Passport JWT
│   │   ├── controllers/
│   │   │   ├── auth.controller.js        # Registro, login y perfil
│   │   │   ├── vehiculos.controller.js   # CRUD de vehículos
│   │   │   ├── conductores.controller.js # CRUD de conductores
│   │   │   └── viajes.controller.js      # CRUD de viajes, historial y cálculo de km
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js        # Protección Passport JWT (401)
│   │   │   └── validateRequest.js        # Manejador de express-validator (400)
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── vehiculos.routes.js
│   │   │   ├── conductores.routes.js
│   │   │   └── viajes.routes.js
│   │   ├── validators/
│   │   │   ├── common.validator.js       # Validación de parámetros ID
│   │   │   ├── auth.validator.js
│   │   │   ├── vehiculos.validator.js
│   │   │   ├── conductores.validator.js
│   │   │   └── viajes.validator.js
│   │   └── index.js                  # Inicialización del servidor Express y rutas
│   ├── .env.example                  # Plantilla de variables de entorno
│   ├── api.http                      # Pruebas HTTP de todos los endpoints
│   ├── package.json
│   ├── schema.sql                    # Script DDL de tablas y datos semilla
│   └── test-api.mjs                  # Script de validación automatizada de la API
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthModal.jsx         # Modal con pestañas de Login y Registro
│   │   │   └── Navbar.jsx            # Barra de navegación interactiva y perfil
│   │   ├── pages/
│   │   │   ├── PublicHome.jsx        # Landing pública de bienvenida
│   │   │   ├── DashboardView.jsx     # Resumen general y métricas globales
│   │   │   ├── VehiculosView.jsx     # Gestión CRUD de vehículos con modales
│   │   │   ├── ConductoresView.jsx   # Gestión CRUD de conductores con licencias
│   │   │   ├── ViajesView.jsx        # Asignación y registro de viajes con filtros
│   │   │   └── HistorialKmView.jsx   # Historial por entidad y cómputo de km
│   │   ├── services/
│   │   │   └── api.js                # Consumo con fetch nativo y gestión de JWT
│   │   ├── styles/
│   │   │   └── main.css              # Estilos completos en CSS puro
│   │   ├── App.jsx                   # Orquestador de estado y vistas
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## ⚙️ Instrucciones de Instalación y Ejecución

### 1. Configuración de la Base de Datos MySQL
Asegurarse de tener el servicio de MySQL activo en el puerto 3306.

En la carpeta `backend/`:
1. Copiar el archivo `.env.example` a `.env` si es necesario:
   ```bash
   cp .env.example .env
   ```
2. Verificar las credenciales en `.env` (usuario y contraseña de MySQL).
3. Opcionalmente, puede inicializar la base de datos de forma manual ejecutando:
   ```bash
   npm run init-db
   ```
   *(Nota: El servidor Express también inicializa la base de datos automáticamente al arrancar).*

### 2. Ejecutar el Backend (API REST)
```bash
cd backend
npm install
npm run dev
```
El servidor backend quedará disponible en `http://localhost:3000`.

### 3. Ejecutar las Pruebas de la API
- **Pruebas automáticas:**
  ```bash
  cd backend
  npm test
  ```
- **Pruebas manuales interactiva:**
  Abrir el archivo `backend/api.http` con la extensión REST Client en VS Code / Antigravity IDE.

### 4. Ejecutar el Frontend (Vite + React)
En una nueva terminal:
```bash
cd frontend
npm install
npm run dev
```
La aplicación web visual e interactiva estará disponible en:  
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 👤 Usuario de Demostración para Pruebas
El sistema cuenta con un usuario inicial precargado automáticamente en MySQL para ingresar de inmediato:
- **Correo Electrónico:** `admin@transporte.com`
- **Contraseña:** `Admin1234!`
- **Vigencia del Token JWT:** 4 horas.

También es posible registrar nuevos usuarios desde el botón *"Iniciar Sesión / Registro"* en la barra superior.
