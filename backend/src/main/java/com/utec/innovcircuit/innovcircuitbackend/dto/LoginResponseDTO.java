package com.utec.innovcircuit.innovcircuitbackend.dto;

import lombok.Data;

@Data
public class LoginResponseDTO {
    private String token;
    private String tipo = "Bearer";

    public LoginResponseDTO(String token) {
        this.token = token;
    }
}