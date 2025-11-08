package com.utec.innovcircuit.innovcircuitbackend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PedidoResponseDTO {
    private Long id;
    private LocalDateTime fechaSolicitud;
    private String estado;
    private String direccionEnvio;
    private String disenoNombre;
    private String clienteNombre;
    private String imagenUrlDiseno;
}