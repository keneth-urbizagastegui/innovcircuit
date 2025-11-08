package com.utec.innovcircuit.innovcircuitbackend.dto;

import lombok.Data;

@Data
public class EstadisticasProveedorDTO {
    private double totalVendido;   // Suma de precios de líneas de sus diseños
    private double gananciaNeta;   // Suma de montoProveedor de sus líneas
    private double totalRetirado;  // Suma de retiros PENDIENTES + APROBADOS
    private double saldoDisponible; // gananciaNeta - totalRetirado
}