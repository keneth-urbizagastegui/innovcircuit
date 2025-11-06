package com.utec.innovcircuit.innovcircuitbackend.controller;

import com.utec.innovcircuit.innovcircuitbackend.dto.CategoriaRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.CategoriaResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.service.ICategoriaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categorias") // Ruta base para todas las categorías
public class CategoriaController {

    @Autowired
    private ICategoriaService categoriaService;

    // Endpoint para CREAR una categoría
    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')") // ¡SOLO ADMIN PUEDE CREAR!
    public ResponseEntity<CategoriaResponseDTO> createCategoria(@Valid @RequestBody CategoriaRequestDTO requestDTO) {
        CategoriaResponseDTO responseDTO = categoriaService.createCategoria(requestDTO);
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    // Endpoint para LEER todas las categorías
    @GetMapping
    public ResponseEntity<List<CategoriaResponseDTO>> getAllCategorias() {
        List<CategoriaResponseDTO> categorias = categoriaService.getAllCategorias();
        return new ResponseEntity<>(categorias, HttpStatus.OK);
    }
}