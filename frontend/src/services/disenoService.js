import apiClient from './api';

const disenoService = {
  // RF6: Listar diseños (aprobados)
  listarDisenosAprobados: (keyword) => {
    // El interceptor añadirá el token "Authorization" a esta petición
    const params = keyword ? { q: keyword } : undefined;
    return apiClient.get('/disenos', { params });
  },
  // Búsqueda avanzada con Strategy
  getAll: ({ q, categoriaId, minPrecio, maxPrecio } = {}) => {
    const params = {};
    if (q && q.trim()) params.q = q.trim();
    if (categoriaId) params.categoriaId = categoriaId;
    if (minPrecio != null && minPrecio !== '') params.minPrecio = Number(minPrecio);
    if (maxPrecio != null && maxPrecio !== '') params.maxPrecio = Number(maxPrecio);
    return apiClient.get('/disenos', { params });
  },
  // Obtener un diseño por ID
  getDisenoById: (id) => {
    // El interceptor añadirá el token
    return apiClient.get(`/disenos/${id}`);
  },
  // *** Nuevas acciones de detalle ***
  darLike: (id) => apiClient.post(`/disenos/${id}/like`),
  descargar: (id) => apiClient.get(`/disenos/${id}/archivo`, { responseType: 'blob' }),
  // Gestión de diseños (Proveedor)
  editarDiseno: (id, data) => apiClient.put(`/disenos/${id}`, data),
  eliminarDiseno: (id) => apiClient.delete(`/disenos/${id}`),
  // Nuevo: Listar diseños destacados (público)
  listarDestacados: () => {
    return apiClient.get('/disenos/destacados');
  },
};

export default disenoService;
