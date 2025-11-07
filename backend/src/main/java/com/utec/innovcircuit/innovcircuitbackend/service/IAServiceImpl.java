package com.utec.innovcircuit.innovcircuitbackend.service;

import com.utec.innovcircuit.innovcircuitbackend.dto.ChatRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.ChatResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.DisenoResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.ProveedorDTO;
import com.utec.innovcircuit.innovcircuitbackend.model.Diseno;
import com.utec.innovcircuit.innovcircuitbackend.model.Resena;
import com.utec.innovcircuit.innovcircuitbackend.repository.DisenoRepository;
import com.utec.innovcircuit.innovcircuitbackend.repository.ResenaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class IAServiceImpl {

    @Autowired
    private DisenoRepository disenoRepository;

    @Autowired
    private ResenaRepository resenaRepository;

    // Orquestación del Chatbot técnico por diseño (simulada)
    public ChatResponseDTO chatbotDiseno(Long disenoId, ChatRequestDTO request) {
        Diseno diseno = disenoRepository.findById(disenoId)
                .orElseThrow(() -> new NoSuchElementException("Diseño no encontrado"));

        List<Resena> resenas = resenaRepository.findByDisenoId(disenoId);

        // Construir contexto con descripción y reseñas
        StringBuilder contexto = new StringBuilder();
        contexto.append("[Contexto del Diseño]\n");
        contexto.append("Nombre: ").append(diseno.getNombre()).append("\n");
        contexto.append("Descripción: ").append(diseno.getDescripcion()).append("\n");
        contexto.append("Precio: ").append(diseno.getPrecio()).append(" | Gratuito: ").append(diseno.isGratuito()).append("\n");
        contexto.append("Categoría: ").append(diseno.getCategoria() != null ? diseno.getCategoria().getNombre() : "N/A").append("\n\n");
        contexto.append("[Reseñas]\n");
        for (Resena r : resenas) {
            contexto.append("- Calificación ").append(r.getCalificacion())
                    .append(" | Comentario: ").append(r.getComentario() != null ? r.getComentario() : "(sin comentario)");
            if (r.getRespuestaProveedor() != null && !r.getRespuestaProveedor().isBlank()) {
                contexto.append(" | Respuesta del proveedor: ").append(r.getRespuestaProveedor());
            }
            contexto.append("\n");
        }

        // Simulación de llamada a IA: devuelve respuesta incluyendo la pregunta
        String respuestaSimulada = "IA Respondiendo a: " + (request != null ? request.getPregunta() : "(sin pregunta)");
        return new ChatResponseDTO(respuestaSimulada);
    }

    // Búsqueda Semántica Asistida (simulada usando búsqueda por nombre)
    public List<DisenoResponseDTO> buscarAsistido(String prompt) {
        List<Diseno> resultados = disenoRepository
                .findByEstadoAndNombreContainingIgnoreCase("APROBADO", prompt == null ? "" : prompt.trim());
        return resultados.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    // Conversión local de Entidad a DTO (similar a DisenoServiceImpl)
    private DisenoResponseDTO mapToResponseDTO(Diseno diseno) {
        DisenoResponseDTO dto = new DisenoResponseDTO();
        dto.setId(diseno.getId());
        dto.setNombre(diseno.getNombre());
        dto.setDescripcion(diseno.getDescripcion());
        dto.setPrecio(diseno.getPrecio());
        dto.setGratuito(diseno.isGratuito());
        dto.setEstado(diseno.getEstado());
        dto.setImagenUrl(diseno.getImagenUrl());
        dto.setEsquematicoUrl(diseno.getEsquematicoUrl());
        dto.setNombreCategoria(diseno.getCategoria() != null ? diseno.getCategoria().getNombre() : null);
        dto.setLikesCount(diseno.getLikesCount());
        dto.setDescargasCount(diseno.getDescargasCount());
        if (diseno.getProveedor() != null) {
            ProveedorDTO provDTO = new ProveedorDTO();
            provDTO.setId(diseno.getProveedor().getId());
            provDTO.setNombre(diseno.getProveedor().getNombre());
            provDTO.setAvatarUrl(diseno.getProveedor().getAvatarUrl());
            dto.setProveedor(provDTO);
        }
        return dto;
    }
}