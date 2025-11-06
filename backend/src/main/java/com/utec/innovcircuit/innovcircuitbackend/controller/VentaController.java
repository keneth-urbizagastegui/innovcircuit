package com.utec.innovcircuit.innovcircuitbackend.controller;

import com.utec.innovcircuit.innovcircuitbackend.dto.CompraRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.VentaResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.service.IVentaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/ventas")
public class VentaController {
    @Autowired
    private IVentaService ventaService;

    @PostMapping("/comprar")
    @PreAuthorize("hasRole('CLIENTE')") // ¡SOLO CLIENTES PUEDEN COMPRAR!
    public ResponseEntity<VentaResponseDTO> realizarCompra(
            @Valid @RequestBody CompraRequestDTO requestDTO,
            Principal principal) {
        String emailCliente = principal.getName();
        VentaResponseDTO response = ventaService.realizarCompra(requestDTO, emailCliente);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}