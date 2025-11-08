package com.utec.innovcircuit.innovcircuitbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class RetiroRequestDTO {
    @Positive(message = "El monto debe ser positivo")
    private Double monto;

    @NotBlank(message = "El método de pago es obligatorio")
    private String metodoPago;
}