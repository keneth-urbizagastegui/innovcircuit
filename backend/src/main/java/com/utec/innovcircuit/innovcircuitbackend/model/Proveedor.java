package com.utec.innovcircuit.innovcircuitbackend.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import lombok.Data;

@Entity
@DiscriminatorValue("PROVEEDOR")
@Data
@lombok.EqualsAndHashCode(callSuper = false)
public class Proveedor extends Usuario {
    // Información pública de la tienda del proveedor
    @Column(columnDefinition = "TEXT")
    private String descripcionTienda;

    @Column
    private String bannerUrl;

    @Column
    private String sitioWebUrl;
}