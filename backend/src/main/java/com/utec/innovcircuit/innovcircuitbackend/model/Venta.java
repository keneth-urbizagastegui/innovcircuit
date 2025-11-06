package com.utec.innovcircuit.innovcircuitbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ventas")
@Data
public class Venta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column(nullable = false)
    private Double montoTotal;

    // Suma de las comisiones de plataforma correspondientes a todas las líneas de esta venta
    @Column
    private Double comisionTotal;

    // Suma del monto neto para proveedores correspondiente a todas las líneas de esta venta
    @Column
    private Double montoProveedorTotal;

    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    // Relación: Una Venta tiene muchas LineasDeVenta
    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LineaVenta> lineasVenta = new ArrayList<>();
}