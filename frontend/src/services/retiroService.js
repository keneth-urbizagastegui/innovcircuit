import apiClient from './api';

const retiroService = {
  // Llama al POST /api/v1/retiros
  solicitarRetiro: (retiroData) => {
    // retiroData = { monto, metodoPago }
    return apiClient.post('/retiros', retiroData);
  },
};

export default retiroService;