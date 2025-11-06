package com.utec.innovcircuit.innovcircuitbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "resenas", uniqueConstraints = {
        // Regla: Un cliente solo puede reseñar un diseño una vez
        @UniqueConstraint(columnNames = {"cliente_id", "diseno_id"})
})
@Data
public class Resena {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int calificacion; // (ej. 1 a 5)

    @Column(columnDefinition = "TEXT")
    private String comentario;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "diseno_id", nullable = false)
    private Diseno diseno;
}