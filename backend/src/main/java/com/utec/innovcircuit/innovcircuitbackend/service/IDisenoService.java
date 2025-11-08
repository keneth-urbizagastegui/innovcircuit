package com.utec.innovcircuit.innovcircuitbackend.service;

import com.utec.innovcircuit.innovcircuitbackend.dto.DisenoRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.DisenoResponseDTO;

import java.util.List;

public interface IDisenoService {
    // Para Proveedor: subir diseño con archivos opcionales (imagen y esquemático)
    DisenoResponseDTO subirDiseno(DisenoRequestDTO requestDTO, String emailProveedor,
                                  org.springframework.web.multipart.MultipartFile imagenFile,
                                  org.springframework.web.multipart.MultipartFile esquematicoFile);

    // Para Administrador
    DisenoResponseDTO aprobarDiseno(Long disenoId);

    // Para Todos (Autenticados) - con búsqueda opcional por nombre
    List<DisenoResponseDTO> listarDisenosAprobados(String keyword);

    DisenoResponseDTO getDisenoById(Long disenoId);

    // Interacciones en detalle
    void darLike(Long disenoId);
    String registrarDescarga(Long disenoId);

    // Administración de productos
    List<DisenoResponseDTO> listarDisenosPorEstado(String estado);
    DisenoResponseDTO rechazarDiseno(Long disenoId);

    // Historial del proveedor: todos sus diseños (cualquier estado)
    List<DisenoResponseDTO> getDisenosPorProveedor(String emailProveedor);

    // Gestión de Diseños (Proveedor)
    DisenoResponseDTO editarDiseno(Long disenoId, DisenoRequestDTO requestDTO, String emailProveedor);
    void eliminarDiseno(Long disenoId, String emailProveedor);

    // Featured
    List<DisenoResponseDTO> listarDisenosDestacados();
    DisenoResponseDTO toggleFeatured(Long disenoId);
}