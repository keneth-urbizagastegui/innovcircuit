import axios from 'axios';

// Instancia centralizada de Axios para la API de InnovCircuit
const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// *** INICIO DEL INTERCEPTOR ***
// Intercepta CADA petición antes de que se envíe
apiClient.interceptors.request.use(
  (config) => {
    // 1. Obtén el token de localStorage
    const token = localStorage.getItem('token');
    // 2. Si el token existe, añádelo a la cabecera Authorization
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config; // Continúa con la petición
  },
  (error) => {
    // Maneja errores de la petición
    return Promise.reject(error);
  }
);
// *** FIN DEL INTERCEPTOR ***

export default apiClient;