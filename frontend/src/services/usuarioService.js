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
  },
  // Nuevo: actualizar mi perfil (nombre y avatarUrl)
  actualizarMiPerfil: (data) => {
    // data = { nombre?: string, avatarUrl?: string }
    return apiClient.put('/usuario/mi-perfil', data);
  }
};

export default usuarioService;