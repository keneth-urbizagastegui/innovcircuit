package com.utec.innovcircuit.innovcircuitbackend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ResenaResponseDTO {
    private Long id;
    private int calificacion;
    private String comentario;
    private LocalDateTime fecha;
    private String nombreCliente;
    private String avatarCliente;
    // Respuesta del proveedor
    private String respuestaProveedor;
    private LocalDateTime fechaRespuesta;
}