package com.utec.innovcircuit.innovcircuitbackend.controller;

import com.utec.innovcircuit.innovcircuitbackend.dto.PreguntaRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.PreguntaResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.RespuestaPreguntaRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.service.PreguntaServiceImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/preguntas")
public class PreguntaController {

    @Autowired
    private PreguntaServiceImpl preguntaService;

    // GET /api/v1/preguntas/diseno/{disenoId} (PÚBLICO)
    @GetMapping("/diseno/{disenoId}")
    public ResponseEntity<List<PreguntaResponseDTO>> getPreguntasPorDiseno(@PathVariable Long disenoId) {
        return ResponseEntity.ok(preguntaService.getPreguntasPorDiseno(disenoId));
    }

    // POST /api/v1/preguntas (AUTENTICADO)
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PreguntaResponseDTO> crearPregunta(
            @Valid @RequestBody PreguntaRequestDTO requestDTO,
            Principal principal) {
        PreguntaResponseDTO response = preguntaService.crearPregunta(requestDTO, principal.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // POST /api/v1/preguntas/{preguntaId}/responder (SOLO PROVEEDOR DUEÑO)
    @PostMapping("/{preguntaId}/responder")
    @PreAuthorize("hasRole('PROVEEDOR')")
    public ResponseEntity<PreguntaResponseDTO> responderPregunta(
            @PathVariable Long preguntaId,
            @Valid @RequestBody RespuestaPreguntaRequestDTO requestDTO,
            Principal principal) {
        PreguntaResponseDTO response = preguntaService.responderPregunta(preguntaId, requestDTO, principal.getName());
        return ResponseEntity.ok(response);
    }
}