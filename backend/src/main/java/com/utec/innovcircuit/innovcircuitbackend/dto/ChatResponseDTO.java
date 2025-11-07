package com.utec.innovcircuit.innovcircuitbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Respuesta del chatbot técnico.
 * Por ahora simula una respuesta incluyendo la pregunta.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponseDTO {
    private String respuesta;
}