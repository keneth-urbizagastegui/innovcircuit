package com.utec.innovcircuit.innovcircuitbackend.controller;

import com.utec.innovcircuit.innovcircuitbackend.dto.PedidoRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.PedidoResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.service.PedidoServiceImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/pedidos")
public class PedidoController {

    @Autowired
    private PedidoServiceImpl pedidoService;

    @PostMapping
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<PedidoResponseDTO> crearPedido(
            @Valid @RequestBody PedidoRequestDTO requestDTO,
            Principal principal) {
        PedidoResponseDTO response = pedidoService.crearPedido(requestDTO, principal.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}