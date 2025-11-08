package com.utec.innovcircuit.innovcircuitbackend.service;

import com.utec.innovcircuit.innovcircuitbackend.dto.PreguntaRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.PreguntaResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.RespuestaPreguntaRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.model.*;
import com.utec.innovcircuit.innovcircuitbackend.repository.DisenoRepository;
import com.utec.innovcircuit.innovcircuitbackend.repository.PreguntaRepository;
import com.utec.innovcircuit.innovcircuitbackend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class PreguntaServiceImpl {

    @Autowired
    private PreguntaRepository preguntaRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private DisenoRepository disenoRepository;

    // Listar preguntas (Público)
    public List<PreguntaResponseDTO> getPreguntasPorDiseno(Long disenoId) {
        return preguntaRepository.findByDisenoIdOrderByFechaPreguntaAsc(disenoId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Crear pregunta (Autenticado)
    public PreguntaResponseDTO crearPregunta(PreguntaRequestDTO requestDTO, String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"));
        Diseno diseno = disenoRepository.findById(requestDTO.getDisenoId())
                .orElseThrow(() -> new NoSuchElementException("Diseño no encontrado"));
        Pregunta pregunta = new Pregunta();
        pregunta.setDiseno(diseno);
        pregunta.setUsuarioPregunta(usuario);
        pregunta.setTextoPregunta(requestDTO.getTextoPregunta());
        pregunta.setFechaPregunta(LocalDateTime.now());
        Pregunta guardada = preguntaRepository.save(pregunta);
        // --- INICIO SIMULACIÓN DE NOTIFICACIÓN ---
        String emailProveedor = guardada.getDiseno().getProveedor().getEmail();
        System.out.println("[NOTIFICACIÓN] Nueva pregunta creada para el diseño: " + guardada.getDiseno().getNombre());
        System.out.println("  -> NOTIFICAR A PROVEEDOR: " + emailProveedor);
        // --- FIN SIMULACIÓN ---
        return convertToDTO(guardada);
    }

    // Responder pregunta (Solo Proveedor dueño)
    public PreguntaResponseDTO responderPregunta(Long preguntaId, RespuestaPreguntaRequestDTO requestDTO, String emailProveedor) {
        Pregunta pregunta = preguntaRepository.findById(preguntaId)
                .orElseThrow(() -> new NoSuchElementException("Pregunta no encontrada"));
        Proveedor proveedor = usuarioRepository.findByEmail(emailProveedor, Proveedor.class)
                .orElseThrow(() -> new NoSuchElementException("Proveedor no encontrado"));
        // Validar que el proveedor autenticado sea el dueño del diseño de la pregunta
        if (pregunta.getDiseno() == null || pregunta.getDiseno().getProveedor() == null ||
                !pregunta.getDiseno().getProveedor().getId().equals(proveedor.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No autorizado: el diseño no pertenece al proveedor autenticado");
        }
        pregunta.setTextoRespuesta(requestDTO.getTextoRespuesta());
        pregunta.setFechaRespuesta(LocalDateTime.now());

        Pregunta guardada = preguntaRepository.save(pregunta);
        // --- INICIO SIMULACIÓN DE NOTIFICACIÓN ---
        String emailCliente = guardada.getUsuarioPregunta().getEmail();
        System.out.println("[NOTIFICACIÓN] El proveedor respondió a una pregunta del diseño: " + guardada.getDiseno().getNombre());
        System.out.println("  -> NOTIFICAR A CLIENTE: " + emailCliente);
        // --- FIN SIMULACIÓN ---
        return convertToDTO(guardada);
    }

    private PreguntaResponseDTO convertToDTO(Pregunta p) {
        PreguntaResponseDTO dto = new PreguntaResponseDTO();
        dto.setId(p.getId());
        dto.setTextoPregunta(p.getTextoPregunta());
        dto.setFechaPregunta(p.getFechaPregunta());
        if (p.getUsuarioPregunta() != null) {
            dto.setNombreUsuarioPregunta(p.getUsuarioPregunta().getNombre());
            dto.setAvatarUsuarioPregunta(p.getUsuarioPregunta().getAvatarUrl());
        }
        dto.setTextoRespuesta(p.getTextoRespuesta());
        dto.setFechaRespuesta(p.getFechaRespuesta());
        // La respuesta siempre viene del proveedor del diseño
        if (p.getDiseno() != null && p.getDiseno().getProveedor() != null) {
            dto.setNombreProveedorRespuesta(p.getDiseno().getProveedor().getNombre());
        }
        return dto;
    }
}