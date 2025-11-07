import apiClient from './api';

const adminService = {
  // Llama al nuevo endpoint del AdminController
  getDisenosPendientes: () => {
    return apiClient.get('/admin/disenos/pendientes');
  },

  // Llama al endpoint de DisenoController (que ya es solo para Admin)
  aprobarDiseno: (id) => {
    return apiClient.post(`/disenos/${id}/aprobar`);
  },

  // Llama al nuevo endpoint del AdminController
  rechazarDiseno: (id) => {
    return apiClient.post(`/admin/disenos/${id}/rechazar`);
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
  }
};

export default adminService;