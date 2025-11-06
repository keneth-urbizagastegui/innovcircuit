import apiClient from './api';

const ventaService = {
  // Llama al POST /api/v1/ventas/comprar
  realizarCompra: (disenoIds) => {
    const requestBody = { disenoIds };
    return apiClient.post('/ventas/comprar', requestBody);
  },
};

export default ventaService;