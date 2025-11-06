package com.utec.innovcircuit.innovcircuitbackend.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;

@Entity
@DiscriminatorValue("CLIENTE")
@Data
@lombok.EqualsAndHashCode(callSuper = false)
public class Cliente extends Usuario {
    // Atributos específicos del cliente (si los hubiera)
}