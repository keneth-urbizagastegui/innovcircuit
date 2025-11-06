package com.utec.innovcircuit.innovcircuitbackend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ResenaRequestDTO {
    @NotNull
    private Long disenoId;

    @Min(1)
    @Max(5)
    private int calificacion;

    private String comentario;
}