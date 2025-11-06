package com.utec.innovcircuit.innovcircuitbackend.dto;

import lombok.Data;

@Data
public class UsuarioAdminDTO {
    private Long id;
    private String nombre;
    private String email;
    private String rol;
    private String estado;
}