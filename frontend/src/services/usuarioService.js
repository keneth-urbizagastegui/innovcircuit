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
  },
  // Reporte detallado de mis compras (Cliente)
  getReporteMisCompras: () => {
    return apiClient.get('/usuario/reporte/mis-compras');
  },
  // Nuevo: obtener mis pedidos de impresión
  getMisPedidos: () => {
    return apiClient.get('/usuario/mis-pedidos');
  },
  // Nuevo: obtener historial de transacciones (Proveedor)
  getMisTransacciones: () => {
    return apiClient.get('/usuario/mis-transacciones');
  },
  // Nuevo: obtener historial de retiros (Proveedor)
  getMisRetiros: () => {
    return apiClient.get('/usuario/mis-retiros');
  },
  // Reclamos (Cliente)
  crearReclamo: ({ lineaId, motivo }) => {
    return apiClient.post('/reclamos', { lineaVentaId: lineaId, motivo });
  }
};

export default usuarioService;
