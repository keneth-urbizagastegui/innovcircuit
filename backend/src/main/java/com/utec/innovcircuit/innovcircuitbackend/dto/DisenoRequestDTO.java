package com.utec.innovcircuit.innovcircuitbackend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class DisenoRequestDTO {
    @NotBlank(message = "El nombre no puede estar vacío")
    @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
    private String nombre;

    private String descripcion;

    @NotNull(message = "El precio no puede ser nulo (use 0 si es gratuito)")
    @PositiveOrZero(message = "El precio debe ser 0 o mayor")
    private Double precio;

    private boolean gratuito;

    @NotNull(message = "El categoriaId no puede ser nulo")
    private Long categoriaId;
    // El ID del proveedor lo sacaremos del Token
}