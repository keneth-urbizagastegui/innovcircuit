package com.utec.innovcircuit.innovcircuitbackend.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;

@Entity
@DiscriminatorValue("ADMINISTRADOR")
@Data
@lombok.EqualsAndHashCode(callSuper = false)
public class Administrador extends Usuario {
    // Atributos futuros de admin
}