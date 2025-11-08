import apiClient from './api';

const preguntaService = {
  // GET (Público)
  getPreguntasPorDiseno: (disenoId) => {
    return apiClient.get(`/preguntas/diseno/${disenoId}`);
  },

  // POST (Autenticado)
  crearPregunta: (data) => {
    // data = { disenoId, textoPregunta }
    return apiClient.post('/preguntas', data);
  },

  // POST (Proveedor)
  responderPregunta: (preguntaId, data) => {
    // data = { textoRespuesta }
    return apiClient.post(`/preguntas/${preguntaId}/responder`, data);
  },
};

export default preguntaService;