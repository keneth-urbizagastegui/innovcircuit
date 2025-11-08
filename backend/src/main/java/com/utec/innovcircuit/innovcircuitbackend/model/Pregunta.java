package com.utec.innovcircuit.innovcircuitbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "preguntas_diseno")
@Data
public class Pregunta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "diseno_id", nullable = false)
    private Diseno diseno;

    @ManyToOne
    @JoinColumn(name = "usuario_pregunta_id", nullable = false)
    private Usuario usuarioPregunta; // Quién hizo la pregunta

    @Column(columnDefinition = "TEXT", nullable = false)
    private String textoPregunta;

    @Column(nullable = false)
    private LocalDateTime fechaPregunta;

    @Column(columnDefinition = "TEXT")
    private String textoRespuesta; // La respuesta del proveedor

    @Column
    private LocalDateTime fechaRespuesta;
}