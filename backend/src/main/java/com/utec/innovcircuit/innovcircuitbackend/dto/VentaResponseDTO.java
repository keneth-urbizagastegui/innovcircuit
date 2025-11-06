package com.utec.innovcircuit.innovcircuitbackend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class VentaResponseDTO {
    private Long id;
    private LocalDateTime fecha;
    private Double montoTotal;
    private String nombreCliente;
    private List<String> disenosComprados; // Lista simple de nombres
}