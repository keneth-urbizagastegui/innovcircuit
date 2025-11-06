package com.utec.innovcircuit.innovcircuitbackend.dto;

import lombok.Data;

@Data
public class UsuarioRegistroDTO {
    private String nombre;
    private String email;
    private String password;
    private String rol; // "CLIENTE" o "PROVEEDOR"
}