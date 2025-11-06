import apiClient from './api';

const usuarioService = {
  // Para Clientes
  getMisCompras: () => {
    return apiClient.get('/usuario/mis-compras');
  },
  // Para Proveedores
  getMisDisenos: () => {
    return apiClient.get('/usuario/mis-disenos');
  }
};

export default usuarioService;