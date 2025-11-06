import apiClient from './api';

const disenoService = {
  // RF6: Listar diseños (aprobados)
  listarDisenosAprobados: () => {
    // El interceptor añadirá el token "Authorization" a esta petición
    return apiClient.get('/disenos');
  },
  // Obtener un diseño por ID
  getDisenoById: (id) => {
    // El interceptor añadirá el token
    return apiClient.get(`/disenos/${id}`);
  },
  // *** Nuevas acciones de detalle ***
  darLike: (id) => apiClient.post(`/disenos/${id}/like`),
  descargar: (id) => apiClient.post(`/disenos/${id}/download`),
};

export default disenoService;