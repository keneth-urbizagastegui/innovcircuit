package com.utec.innovcircuit.innovcircuitbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "categorias")
@Data
@NoArgsConstructor
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;

    private String descripcion;

    // Relación (la añadiremos después)
    // @OneToMany(mappedBy = "categoria")
    // private List<Diseno> disenos;
}