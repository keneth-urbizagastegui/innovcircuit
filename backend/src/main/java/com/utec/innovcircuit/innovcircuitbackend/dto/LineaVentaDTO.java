package com.utec.innovcircuit.innovcircuitbackend.dto;

import lombok.Data;

@Data
public class LineaVentaDTO {
    private Long id;
    private Long disenoId;
    private String disenoNombre;
    private Double precioAlComprar;
    private Double comisionPlataforma;
    private Double montoProveedor;
}