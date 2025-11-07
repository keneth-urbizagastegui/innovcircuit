import apiClient from './api';

// Servicio para integrar endpoints de IA
const iaService = {
  // Chatbot técnico por diseño
  chatbotDiseno: (id, data) => {
    // data = { pregunta }
    return apiClient.post(`/ia/chatbot-diseno/${id}`, data);
  },
  // Búsqueda asistida semántica
  buscarAsistido: (data) => {
    // data = { prompt }
    return apiClient.post('/ia/buscar-asistido', data);
  },
};

export default iaService;