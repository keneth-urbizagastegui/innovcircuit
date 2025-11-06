package com.utec.innovcircuit.innovcircuitbackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UsuarioEstadoDTO {
    @NotBlank(message = "El estado no puede estar vacío")
    private String estado;
}