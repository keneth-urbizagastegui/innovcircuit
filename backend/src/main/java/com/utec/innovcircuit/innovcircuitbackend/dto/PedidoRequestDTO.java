package com.utec.innovcircuit.innovcircuitbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PedidoRequestDTO {
    @NotNull
    private Long disenoId;

    @NotBlank(message = "La dirección de envío es obligatoria")
    private String direccionEnvio;
}