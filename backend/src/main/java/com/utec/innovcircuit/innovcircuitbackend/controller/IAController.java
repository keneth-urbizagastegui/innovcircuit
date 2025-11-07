package com.utec.innovcircuit.innovcircuitbackend.controller;

import com.utec.innovcircuit.innovcircuitbackend.dto.ChatRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.ChatResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.DisenoResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.service.IAServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ia")
@PreAuthorize("isAuthenticated()")
public class IAController {

    @Autowired
    private IAServiceImpl iaService;

    // Tarea 5.1: Chatbot Técnico por Diseño
    @PostMapping("/chatbot-diseno/{id}")
    public ResponseEntity<ChatResponseDTO> chatbotDiseno(@PathVariable("id") Long disenoId,
                                                         @RequestBody ChatRequestDTO request) {
        return ResponseEntity.ok(iaService.chatbotDiseno(disenoId, request));
    }

    // Tarea 5.2: Búsqueda Semántica Asistida (simulada)
    @PostMapping("/buscar-asistido")
    public ResponseEntity<List<DisenoResponseDTO>> buscarAsistido(@RequestBody Map<String, String> body) {
        String prompt = body.getOrDefault("prompt", "");
        return ResponseEntity.ok(iaService.buscarAsistido(prompt));
    }
}