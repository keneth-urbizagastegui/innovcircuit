package com.utec.innovcircuit.innovcircuitbackend.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class CompraRequestDTO {
    @NotEmpty(message = "La lista de IDs de diseño no puede estar vacía")
    private List<Long> disenoIds;
    // Aquí iría la info de pago, ej: "tokenDePagoStripe"
    // private String tokenPago;
}