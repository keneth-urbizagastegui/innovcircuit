package com.utec.innovcircuit.innovcircuitbackend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "usuarios")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE) // Estrategia de herencia
@DiscriminatorColumn(name = "rol", discriminatorType = DiscriminatorType.STRING)
@Data
public abstract class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column
    private String avatarUrl;

    @Column(nullable = false)
    private String estado = "ACTIVO"; // ACTIVO, BLOQUEADO, etc.
    // El @DiscriminatorColumn 'rol' se llenará automáticamente
}