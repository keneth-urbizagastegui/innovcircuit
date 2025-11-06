import apiClient from './api';

const usuarioService = {
  // Para Clientes
  getMisCompras: () => {
    return apiClient.get('/usuario/mis-compras');
  },
  // Para Proveedores
  getMisDisenos: () => {
    return apiClient.get('/usuario/mis-disenos');
  },
  // Nuevo: estadísticas del proveedor
  getMiDashboard: () => {
    return apiClient.get('/usuario/mi-dashboard');
  }
};

export default usuarioService;