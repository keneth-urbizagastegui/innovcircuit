package com.utec.innovcircuit.innovcircuitbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "retiros")
@Data
public class Retiro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "proveedor_id", nullable = false)
    private Proveedor proveedor;

    @Column(nullable = false)
    private Double monto;

    @Column(nullable = false)
    private String estado; // "PENDIENTE", "APROBADO", "RECHAZADO"

    @Column(nullable = false)
    private LocalDateTime fechaSolicitud;

    @Column
    private LocalDateTime fechaProcesado;

    @Column(columnDefinition = "TEXT")
    private String metodoPago; // Ej: "BCP - CCI: 123-456..."
}