package com.utec.innovcircuit.innovcircuitbackend.controller;

import com.utec.innovcircuit.innovcircuitbackend.dto.UsuarioLoginDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.LoginResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.UsuarioRegistroDTO;
import com.utec.innovcircuit.innovcircuitbackend.service.IUsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    @Autowired
    private IUsuarioService usuarioService;

    @PostMapping("/register")
    public ResponseEntity<?> registrarUsuario(@RequestBody UsuarioRegistroDTO registroDTO) {
        try {
            usuarioService.registrarUsuario(registroDTO);
            return new ResponseEntity<>("Usuario registrado exitosamente!", HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UsuarioLoginDTO loginDTO) {
        try {
            LoginResponseDTO response = usuarioService.login(loginDTO);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Si las credenciales son inválidas, devolvemos 401 Unauthorized
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }
}