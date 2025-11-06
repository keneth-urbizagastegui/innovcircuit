import apiClient from './api';

const disenoService = {
  // RF6: Listar diseños (aprobados)
  listarDisenosAprobados: (keyword) => {
    // El interceptor añadirá el token "Authorization" a esta petición
    const params = keyword ? { q: keyword } : undefined;
    return apiClient.get('/disenos', { params });
  },
  // Obtener un diseño por ID
  getDisenoById: (id) => {
    // El interceptor añadirá el token
    return apiClient.get(`/disenos/${id}`);
  },
  // *** Nuevas acciones de detalle ***
  darLike: (id) => apiClient.post(`/disenos/${id}/like`),
  descargar: (id) => apiClient.post(`/disenos/${id}/download`),
  // Gestión de diseños (Proveedor)
  editarDiseno: (id, data) => apiClient.put(`/disenos/${id}`, data),
  eliminarDiseno: (id) => apiClient.delete(`/disenos/${id}`),
};

export default disenoService;