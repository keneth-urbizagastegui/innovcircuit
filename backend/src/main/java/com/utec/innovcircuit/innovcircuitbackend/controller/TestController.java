package com.utec.innovcircuit.innovcircuitbackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/test")
@PreAuthorize("isAuthenticated()") // Requiere que esté logueado para toda la clase
public class TestController {

    @GetMapping("/todos")
    public ResponseEntity<String> getParaTodos() {
        return ResponseEntity.ok("Este endpoint es para TODOS los usuarios logueados.");
    }

    @GetMapping("/cliente")
    @PreAuthorize("hasRole('CLIENTE')") // ¡Solo ROLE_CLIENTE!
    public ResponseEntity<String> getParaCliente() {
        return ResponseEntity.ok("¡Éxito! Eres un CLIENTE.");
    }

    @GetMapping("/proveedor")
    @PreAuthorize("hasRole('PROVEEDOR')") // ¡Solo ROLE_PROVEEDOR!
    public ResponseEntity<String> getParaProveedor() {
        return ResponseEntity.ok("¡Éxito! Eres un PROVEEDOR.");
    }
}