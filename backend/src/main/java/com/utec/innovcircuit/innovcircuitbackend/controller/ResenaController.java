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

    // Nota: El GET "/disenos/{disenoId}/resenas" se movió a DisenoController para
    // alinearse con las rutas públicas de "/api/v1/disenos/**" definidas en SecurityConfig.

    // Endpoint de prueba para diagnosticar permisos
    @GetMapping("/resena-test")
    public ResponseEntity<String> resenaTest() {
        return ResponseEntity.ok("resena-test-ok");
    }
}