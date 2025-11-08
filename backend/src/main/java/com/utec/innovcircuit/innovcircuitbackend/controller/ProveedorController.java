package com.utec.innovcircuit.innovcircuitbackend.controller;

import com.utec.innovcircuit.innovcircuitbackend.dto.ProveedorDTO;
import com.utec.innovcircuit.innovcircuitbackend.service.IProveedorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/proveedores")
public class ProveedorController {

    @Autowired
    private IProveedorService proveedorService;

    // Endpoint PÚBLICO
    @GetMapping("/{id}")
    public ResponseEntity<ProveedorDTO> getProveedorPublico(@PathVariable Long id) {
        return ResponseEntity.ok(proveedorService.getProveedorPublicoById(id));
    }
}