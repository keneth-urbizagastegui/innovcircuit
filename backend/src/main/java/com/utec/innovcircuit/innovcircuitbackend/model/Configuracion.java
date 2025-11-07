package com.utec.innovcircuit.innovcircuitbackend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "configuraciones")
@Data
public class Configuracion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "clave", unique = true, nullable = false, length = 100)
    private String clave;

    @Column(name = "valor", nullable = false, length = 255)
    private String valor;
}