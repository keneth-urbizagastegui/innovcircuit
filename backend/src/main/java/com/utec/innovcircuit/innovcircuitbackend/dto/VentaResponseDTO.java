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
    // Lista simple de nombres (mantener compatibilidad con clientes existentes)
    private List<String> disenosComprados;

    // Campos detallados para reportes completos
    private Double comisionTotal;
    private Double montoProveedorTotal;
    private List<LineaVentaDTO> lineas;
}