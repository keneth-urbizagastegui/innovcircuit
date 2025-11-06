package com.utec.innovcircuit.innovcircuitbackend.service;

import com.utec.innovcircuit.innovcircuitbackend.dto.CategoriaRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.CategoriaResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.model.Categoria;
import com.utec.innovcircuit.innovcircuitbackend.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoriaServiceImpl implements ICategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Override
    public CategoriaResponseDTO createCategoria(CategoriaRequestDTO categoriaRequestDTO) {
        // 1. Convertir DTO a Entidad
        Categoria categoria = new Categoria();
        categoria.setNombre(categoriaRequestDTO.getNombre());
        categoria.setDescripcion(categoriaRequestDTO.getDescripcion());

        // 2. Guardar en BD (usando el DAO/Repository)
        Categoria savedCategoria = categoriaRepository.save(categoria);

        // 3. Convertir Entidad a DTO de respuesta
        return convertToDTO(savedCategoria);
    }

    @Override
    public List<CategoriaResponseDTO> getAllCategorias() {
        return categoriaRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Método privado de mapeo (buena práctica)
    private CategoriaResponseDTO convertToDTO(Categoria categoria) {
        CategoriaResponseDTO dto = new CategoriaResponseDTO();
        dto.setId(categoria.getId());
        dto.setNombre(categoria.getNombre());
        dto.setDescripcion(categoria.getDescripcion());
        return dto;
    }
}