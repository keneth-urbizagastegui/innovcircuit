import apiClient from './api';

const authService = {
  // RF1: Registrar usuario
  register: (userData) => {
    // userData: { nombre, email, password, rol }
    return apiClient.post('/auth/register', userData);
  },

  // RF3: Iniciar sesión
  login: (credentials) => {
    // credentials: { email, password }
    return apiClient.post('/auth/login', credentials);
  },
};

export default authService;