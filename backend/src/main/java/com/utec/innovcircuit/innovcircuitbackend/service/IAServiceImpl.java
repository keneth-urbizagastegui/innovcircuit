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

    // Orquestación del Chatbot técnico por diseño (Simulación Avanzada)
    public ChatResponseDTO chatbotDiseno(Long disenoId, ChatRequestDTO request) {
        Diseno diseno = disenoRepository.findById(disenoId)
                .orElseThrow(() -> new NoSuchElementException("Diseño no encontrado"));

        List<Resena> resenas = resenaRepository.findByDisenoId(disenoId);

        // Construir contexto con descripción y reseñas
        StringBuilder contexto = new StringBuilder();
        contexto.append("[Contexto del Diseño]\n");
        contexto.append("Nombre: ").append(diseno.getNombre()).append("\n");
        contexto.append("Descripción: ").append(diseno.getDescripcion()).append("\n");
        contexto.append("Precio: ").append(diseno.getPrecio()).append(" | Gratuito: ").append(Boolean.TRUE.equals(diseno.getGratuito())).append("\n");
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

        // Simulación avanzada: construimos una consulta tipo "Google Search" con el contexto + pregunta
        String pregunta = (request != null ? request.getPregunta() : "").trim();
        String query = (diseno.getNombre() + " "
                + (diseno.getCategoria() != null ? diseno.getCategoria().getNombre() : "") + " "
                + pregunta).trim();

        // Nota: En una implementación real, aquí se integraría un cliente HTTP para consultar un motor de búsqueda
        // como Google Programmable Search o similar y parsear los resultados.
        // Como "Simulación Avanzada", devolvemos una respuesta basada en el contexto y mostrando la consulta generada.
        String respuesta = "Consulta sugerida: '" + query + "'.\n" +
                "Resumen técnico basado en el contexto: El diseño '" + diseno.getNombre() + "' en la categoría '" +
                (diseno.getCategoria() != null ? diseno.getCategoria().getNombre() : "N/A") +
                "' tiene un precio de " + diseno.getPrecio() + ". " +
                "Usuarios reportan (" + resenas.size() + " reseñas). " +
                "Pregunta: '" + pregunta + "'.";
        return new ChatResponseDTO(respuesta);
    }

    // Búsqueda Semántica Asistida (Simulación Avanzada)
    public List<DisenoResponseDTO> buscarAsistido(String prompt) {
        String p = prompt == null ? "" : prompt.trim();
        // 1) Listamos todos los diseños aprobados
        List<Diseno> aprobados = disenoRepository.findByEstado("APROBADO");
        if (p.isEmpty()) {
            // Sin prompt: devolvemos aprobados (comportamiento por defecto)
            return aprobados.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
        }
        // 2) Simulación avanzada: filtramos diseños cuyo nombre coincida con tokens del prompt
        String[] tokens = p.toLowerCase().split("\\s+");
        List<Diseno> filtrados = aprobados.stream()
                .filter(d -> {
                    String nombre = d.getNombre() != null ? d.getNombre().toLowerCase() : "";
                    for (String t : tokens) {
                        if (t.length() >= 3 && nombre.contains(t)) return true;
                    }
                    return false;
                })
                .collect(Collectors.toList());
        return filtrados.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    // Conversión local de Entidad a DTO (similar a DisenoServiceImpl)
    private DisenoResponseDTO mapToResponseDTO(Diseno diseno) {
        DisenoResponseDTO dto = new DisenoResponseDTO();
        dto.setId(diseno.getId());
        dto.setNombre(diseno.getNombre());
        dto.setDescripcion(diseno.getDescripcion());
        dto.setPrecio(diseno.getPrecio());
        dto.setGratuito(Boolean.TRUE.equals(diseno.getGratuito()));
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