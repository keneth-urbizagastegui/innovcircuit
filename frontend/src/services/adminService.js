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
  }
};

export default adminService;