package com.utec.innovcircuit.innovcircuitbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "pedidos")
@Data
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime fechaSolicitud;

    @Column(nullable = false)
    private String estado; // Ej: "PENDIENTE_IMPRESION", "EN_PROCESO", "ENVIADO", "ENTREGADO"

    @Column(columnDefinition = "TEXT")
    private String direccionEnvio;

    private Double costoEnvio;

    @Column
    private String codigoSeguimientoFabrica;

    // Relación: Un pedido pertenece a un Cliente
    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    // Relación: Un pedido es sobre un Diseño específico
    @ManyToOne
    @JoinColumn(name = "diseno_id", nullable = false)
    private Diseno diseno;
}
