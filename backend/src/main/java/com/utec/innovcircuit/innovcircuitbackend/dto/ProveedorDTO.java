package com.utec.innovcircuit.innovcircuitbackend.dto;

import lombok.Data;

@Data
public class ProveedorDTO {
    private Long id;
    private String nombre;
    private String avatarUrl;
    private String descripcionTienda;
    private String bannerUrl;
    private String sitioWebUrl;
}