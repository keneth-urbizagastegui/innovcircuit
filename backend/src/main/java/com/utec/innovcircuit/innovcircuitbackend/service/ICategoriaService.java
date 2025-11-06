package com.utec.innovcircuit.innovcircuitbackend.service;

import com.utec.innovcircuit.innovcircuitbackend.dto.CategoriaRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.CategoriaResponseDTO;

import java.util.List;

public interface ICategoriaService {
    CategoriaResponseDTO createCategoria(CategoriaRequestDTO categoriaRequestDTO);
    List<CategoriaResponseDTO> getAllCategorias();
}