package com.utec.innovcircuit.innovcircuitbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PreguntaRequestDTO {
    @NotNull
    private Long disenoId;
    @NotBlank
    private String textoPregunta;
}