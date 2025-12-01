package com.utec.innovcircuit.innovcircuitbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "disenos")
@Data
public class Diseno {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private String descripcion;

    private Double precio;

    private Boolean gratuito = false;

    @Column(nullable = false)
    private String estado = "PENDIENTE"; // PENDIENTE, APROBADO, RECHAZADO

    @Column
    private String imagenUrl;

    @Column
    private String esquematicoUrl; // URL al archivo .zip o .rar

    @Column
    private int likesCount = 0;

    @Column
    private int descargasCount = 0;

    @Column
    private Boolean featured = false;

    // Relación: Muchos diseños pertenecen a Una Categoría
    @ManyToOne
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    // Relación: Muchos diseños pertenecen a Un Proveedor
    @ManyToOne
    @JoinColumn(name = "proveedor_id", nullable = false)
    private Proveedor proveedor;

    @OneToMany(mappedBy = "diseno", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DisenoImagen> imagenes = new ArrayList<>();
}
