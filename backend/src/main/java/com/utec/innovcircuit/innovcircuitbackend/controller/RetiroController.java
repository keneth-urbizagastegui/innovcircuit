package com.utec.innovcircuit.innovcircuitbackend.controller;

import com.utec.innovcircuit.innovcircuitbackend.dto.RetiroRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.RetiroResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.service.IRetiroService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/retiros")
@PreAuthorize("hasRole('PROVEEDOR')")
public class RetiroController {

    @Autowired
    private IRetiroService retiroService;

    @PostMapping
    public ResponseEntity<RetiroResponseDTO> crearRetiro(
            @Valid @RequestBody RetiroRequestDTO requestDTO,
            Principal principal) {
        RetiroResponseDTO response = retiroService.crearRetiro(requestDTO, principal.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}