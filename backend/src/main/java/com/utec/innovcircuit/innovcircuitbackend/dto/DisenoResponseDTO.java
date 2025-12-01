package com.utec.innovcircuit.innovcircuitbackend.dto;

import lombok.Data;
import java.util.List;

@Data
public class DisenoResponseDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private Double precio;
    private boolean gratuito;
    private String estado;
    private String imagenUrl;
    private String esquematicoUrl;
    private String nombreCategoria;

    // Campos nuevos de estadísticas
    private int likesCount;
    private int descargasCount;

    private boolean featured;

    // Proveedor anidado
    private ProveedorDTO proveedor;

    private List<String> imagenesUrls;
}
