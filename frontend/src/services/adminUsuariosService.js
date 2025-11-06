import apiClient from './api';

const adminUsuariosService = {
  listarUsuarios: () => apiClient.get('/admin/usuarios'),
  actualizarEstado: (id, estado) => apiClient.put(`/admin/usuarios/${id}/estado`, { estado }),
  eliminarUsuario: (id) => apiClient.delete(`/admin/usuarios/${id}`),
};

export default adminUsuariosService;