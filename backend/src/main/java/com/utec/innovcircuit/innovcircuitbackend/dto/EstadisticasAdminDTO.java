package com.utec.innovcircuit.innovcircuitbackend.dto;

import lombok.Data;

@Data
public class EstadisticasAdminDTO {
    private double totalVentasGlobal; // Suma de montoTotal de todas las ventas
    private double totalComisiones;   // Suma de comisionTotal de todas las ventas
}