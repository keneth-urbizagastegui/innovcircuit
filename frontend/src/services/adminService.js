import apiClient from './api';

const adminService = {
  // Llama al nuevo endpoint del AdminController
  getDisenosPendientes: () => {
    return apiClient.get('/admin/disenos/pendientes');
  },

  // Nuevos: Gestión de diseños aprobados (Admin)
  getDisenosAprobados: () => {
    return apiClient.get('/admin/disenos/aprobados');
  },
  toggleFeatured: (id) => {
    return apiClient.post(`/admin/disenos/${id}/toggle-featured`);
  },

  // Llama al endpoint de DisenoController (que ya es solo para Admin)
  aprobarDiseno: (id) => {
    return apiClient.post(`/disenos/${id}/aprobar`);
  },

  // Llama al nuevo endpoint del AdminController
  rechazarDiseno: (id) => {
    return apiClient.post(`/admin/disenos/${id}/rechazar`);
  },
  aprobarTodosPendientes: () => {
    return apiClient.post('/admin/disenos/aprobar-todos');
  },
  // Nuevo: estadísticas globales del admin
  getEstadisticasAdmin: () => {
    return apiClient.get('/admin/estadisticas');
  },
  // Configuraciones (Admin)
  getConfiguraciones: () => {
    return apiClient.get('/admin/configuracion');
  },
  actualizarConfiguracion: (clave, valor) => {
    return apiClient.put(`/admin/configuracion/${encodeURIComponent(clave)}`, { valor });
  },
  // Reporte de ventas (Admin)
  getReporteVentas: () => {
    return apiClient.get('/admin/reporte/ventas');
  },
  // Gestión de Pedidos de Impresión (Admin)
  getPedidos: (estado) => {
    const params = estado ? { estado } : {};
    return apiClient.get('/admin/pedidos', { params });
  },
  actualizarEstadoPedido: (id, estado) => {
    return apiClient.post(`/admin/pedidos/${id}/actualizar-estado`, { estado });
  },
  // Gestión de Retiros (Admin)
  getRetiros: (estado) => {
    const params = estado ? { estado } : {};
    return apiClient.get('/admin/retiros', { params });
  },
  procesarRetiro: (id, estado) => {
    return apiClient.post(`/admin/retiros/${id}/procesar`, { estado });
  },
  enviarAFabrica: (id) => {
    return apiClient.post(`/admin/pedidos/${id}/enviar-fabrica`);
  },
  getReclamos: () => {
    return apiClient.get('/admin/reclamos');
  },
  resolverReclamo: (id, aceptarReembolso) => {
    return apiClient.post(`/admin/reclamos/${id}/resolver`, { aceptarReembolso });
  }
};

export default adminService;
