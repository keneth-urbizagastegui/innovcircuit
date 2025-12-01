package com.utec.innovcircuit.innovcircuitbackend.controller;

import com.utec.innovcircuit.innovcircuitbackend.dto.PedidoRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.PedidoResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.service.PedidoServiceImpl;
import com.utec.innovcircuit.innovcircuitbackend.service.external.IFabricacionProvider;
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

    @Autowired
    private IFabricacionProvider fabricacionProvider;

    @PostMapping
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<PedidoResponseDTO> crearPedido(
            @Valid @RequestBody PedidoRequestDTO requestDTO,
            Principal principal) {
        PedidoResponseDTO response = pedidoService.crearPedido(requestDTO, principal.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/cotizar/{disenoId}")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<java.util.Map<String, Double>> cotizar(@PathVariable Long disenoId) {
        Double costo = fabricacionProvider.cotizarFabricacion(disenoId);
        return ResponseEntity.ok(java.util.Map.of("costoEstimado", costo));
    }
}
