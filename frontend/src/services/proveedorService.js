import apiClient from './api';

const proveedorService = {
  getProveedorById: (id) => {
    return apiClient.get(`/proveedores/${id}`);
  },
};

export default proveedorService;