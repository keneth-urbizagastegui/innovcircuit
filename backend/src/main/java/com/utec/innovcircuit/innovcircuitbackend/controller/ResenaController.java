package com.utec.innovcircuit.innovcircuitbackend.controller;

import com.utec.innovcircuit.innovcircuitbackend.dto.ResenaRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.ResenaResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.service.IResenaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class ResenaController {
    @Autowired
    private IResenaService resenaService;

    // Endpoint para que un CLIENTE cree una reseña
    @PostMapping("/resenas")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<ResenaResponseDTO> crearResena(@Valid @RequestBody ResenaRequestDTO requestDTO, Principal principal) {
        ResenaResponseDTO resena = resenaService.crearResena(requestDTO, principal.getName());
        return new ResponseEntity<>(resena, HttpStatus.CREATED);
    }

    // Endpoint PÚBLICO para que TODOS vean las reseñas de un diseño
    @GetMapping("/disenos/{disenoId}/resenas")
    public ResponseEntity<List<ResenaResponseDTO>> getResenas(@PathVariable Long disenoId) {
        return ResponseEntity.ok(resenaService.getResenasPorDiseno(disenoId));
    }
}