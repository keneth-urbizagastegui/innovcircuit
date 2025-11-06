package com.utec.innovcircuit.innovcircuitbackend.dto;

import lombok.Data;

@Data
public class SeedDisenoDTO {
    private String nombre;
    private String descripcion;
    private Double precio;
    private String imagenUrl;
    private String categoria; // Usaremos esto para buscar/crear la categoría
}