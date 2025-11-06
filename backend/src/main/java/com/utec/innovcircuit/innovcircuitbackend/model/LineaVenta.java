package com.utec.innovcircuit.innovcircuitbackend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "lineas_venta")
@Data
public class LineaVenta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "venta_id", nullable = false)
    private Venta venta;

    @ManyToOne
    @JoinColumn(name = "diseno_id", nullable = false)
    private Diseno diseno;

    @Column(nullable = false)
    private Double precioAlComprar; // Precio en el momento de la compra
}