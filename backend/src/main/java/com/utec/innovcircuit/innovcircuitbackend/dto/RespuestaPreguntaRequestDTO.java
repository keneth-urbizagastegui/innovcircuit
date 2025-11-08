package com.utec.innovcircuit.innovcircuitbackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RespuestaPreguntaRequestDTO {
    @NotBlank
    private String textoRespuesta;
}