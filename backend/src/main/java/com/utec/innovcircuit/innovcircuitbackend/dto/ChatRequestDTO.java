package com.utec.innovcircuit.innovcircuitbackend.dto;

import lombok.Data;

/**
 * Petición para el chatbot técnico por diseño.
 * Contiene la pregunta del usuario.
 */
@Data
public class ChatRequestDTO {
    private String pregunta;
}