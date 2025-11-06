import apiClient from './api';

const categoriaService = {
  // Llama al GET /api/v1/categorias
  listarCategorias: () => {
    // El interceptor añadirá el token
    return apiClient.get('/categorias');
  },
};

export default categoriaService;