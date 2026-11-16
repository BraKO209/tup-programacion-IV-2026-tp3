const API_URL = 'http://localhost:3000/api';

/**
 * Gestión de Tokens y Sesión en LocalStorage
 */
export const authStorage = {
  getToken: () => localStorage.getItem('token_transporte'),
  setToken: (token) => localStorage.setItem('token_transporte', token),
  removeToken: () => localStorage.removeItem('token_transporte'),
  getUser: () => {
    try {
      const u = localStorage.getItem('usuario_transporte');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem('usuario_transporte', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('usuario_transporte'),
  clear: () => {
    localStorage.removeItem('token_transporte');
    localStorage.removeItem('usuario_transporte');
  }
};

/**
 * Función base para realizar peticiones HTTP mediante fetch
 */
async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = authStorage.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    // Intentar parsear respuesta JSON
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      // Manejar error estructurado
      let errorMessage = data.error || data.message || 'Error en la solicitud al servidor.';
      if (data.detalles && Array.isArray(data.detalles)) {
        const errorList = data.detalles.map(d => `${d.campo}: ${d.mensaje}`).join(' | ');
        errorMessage = `${errorMessage} (${errorList})`;
      }

      const err = new Error(errorMessage);
      err.status = response.status;
      err.data = data;

      // Si es 401 y hay token guardado, limpiar sesión
      if (response.status === 401 && token) {
        authStorage.clear();
      }

      throw err;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Servicios de la API
 */
export const api = {
  // Autenticación
  auth: {
    login: async (email, password) => {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (res.token) {
        authStorage.setToken(res.token);
        authStorage.setUser(res.usuario);
      }
      return res;
    },
    register: async (nombre, email, password) => {
      return await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ nombre, email, password })
      });
    },
    profile: async () => {
      return await request('/auth/profile');
    },
    logout: () => {
      authStorage.clear();
    }
  },

  // Vehículos
  vehiculos: {
    getAll: () => request('/vehiculos'),
    getById: (id) => request(`/vehiculos/${id}`),
    create: (data) => request('/vehiculos', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/vehiculos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/vehiculos/${id}`, {
      method: 'DELETE'
    })
  },

  // Conductores
  conductores: {
    getAll: () => request('/conductores'),
    getById: (id) => request(`/conductores/${id}`),
    create: (data) => request('/conductores', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/conductores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/conductores/${id}`, {
      method: 'DELETE'
    })
  },

  // Viajes
  viajes: {
    getAll: (params = {}) => {
      const searchParams = new URLSearchParams();
      if (params.vehiculo_id) searchParams.append('vehiculo_id', params.vehiculo_id);
      if (params.conductor_id) searchParams.append('conductor_id', params.conductor_id);
      const queryStr = searchParams.toString();
      return request(`/viajes${queryStr ? `?${queryStr}` : ''}`);
    },
    getById: (id) => request(`/viajes/${id}`),
    create: (data) => request('/viajes', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/viajes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/viajes/${id}`, {
      method: 'DELETE'
    }),
    getHistorialVehiculo: (id) => request(`/viajes/historial/vehiculo/${id}`),
    getHistorialConductor: (id) => request(`/viajes/historial/conductor/${id}`),
    getEstadisticas: () => request('/viajes/estadisticas/kilometros')
  }
};

