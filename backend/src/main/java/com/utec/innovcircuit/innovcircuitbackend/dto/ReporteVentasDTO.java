package com.utec.innovcircuit.innovcircuitbackend.dto;

import java.util.List;
import lombok.Data;

@Data
public class ReporteVentasDTO {
    private Double totalVentasGlobal;
    private Double totalComisiones;
    private Double totalMontoProveedor;
    private List<VentaResponseDTO> ventas;
}