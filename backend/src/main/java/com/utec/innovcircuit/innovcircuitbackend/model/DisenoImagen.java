package com.utec.innovcircuit.innovcircuitbackend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "diseno_imagenes")
@Data
public class DisenoImagen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diseno_id", nullable = false)
    private Diseno diseno;

    @Column(nullable = false)
    private String url;

    @Column
    private String altText;

    @Column
    private Integer orden = 0;

    @Column
    private Boolean thumbnail = false;
}
