import apiClient from './api';

const pedidoService = {
  // Llama al POST /api/v1/pedidos
  crearPedido: (pedidoData) => {
    // pedidoData = { disenoId, direccionEnvio }
    return apiClient.post('/pedidos', pedidoData);
  },
};

export default pedidoService;