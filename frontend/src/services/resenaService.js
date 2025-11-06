import apiClient from './api';

const resenaService = {
  // Obtener reseñas (público)
  getResenasPorDiseno: (disenoId) => {
    return apiClient.get(`/disenos/${disenoId}/resenas`);
  },

  // Crear reseña (protegido)
  crearResena: (resenaData) => {
    // resenaData = { disenoId, calificacion, comentario }
    return apiClient.post('/resenas', resenaData);
  },
  // Responder reseña (Proveedor dueño del diseño)
  responderResena: (resenaId, data) => {
    // data = { respuesta }
    return apiClient.post(`/resenas/${resenaId}/responder`, data);
  },
};

export default resenaService;