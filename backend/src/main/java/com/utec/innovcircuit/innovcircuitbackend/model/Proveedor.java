package com.utec.innovcircuit.innovcircuitbackend.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;

@Entity
@DiscriminatorValue("PROVEEDOR")
@Data
@lombok.EqualsAndHashCode(callSuper = false)
public class Proveedor extends Usuario {
    // Atributos específicos del proveedor (si los hubiera)
}