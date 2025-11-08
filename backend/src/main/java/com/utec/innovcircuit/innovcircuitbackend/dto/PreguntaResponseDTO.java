package com.utec.innovcircuit.innovcircuitbackend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PreguntaResponseDTO {
    private Long id;
    private String textoPregunta;
    private LocalDateTime fechaPregunta;
    private String nombreUsuarioPregunta;
    private String avatarUsuarioPregunta;

    private String textoRespuesta;
    private LocalDateTime fechaRespuesta;
    private String nombreProveedorRespuesta; // Nombre del proveedor que respondió
}