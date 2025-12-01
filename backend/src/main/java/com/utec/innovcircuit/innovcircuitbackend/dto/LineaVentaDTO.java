package com.utec.innovcircuit.innovcircuitbackend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LineaVentaDTO {
    private Long id;
    private Long disenoId;
    private String disenoNombre;
    private Double precioAlComprar;
    private Double comisionPlataforma;
    private Double montoProveedor;
    private LocalDateTime fechaVenta;
    private String estadoFinanciero;
    private String motivoReclamo;
    private LocalDateTime fechaLiberacion;
}
