package com.utec.innovcircuit.innovcircuitbackend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RetiroResponseDTO {
    private Long id;
    private Double monto;
    private String estado;
    private LocalDateTime fechaSolicitud;
    private LocalDateTime fechaProcesado;
    private String metodoPago;
}