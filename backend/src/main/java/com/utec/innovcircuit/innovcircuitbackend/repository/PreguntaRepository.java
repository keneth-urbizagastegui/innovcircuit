package com.utec.innovcircuit.innovcircuitbackend.repository;

import com.utec.innovcircuit.innovcircuitbackend.model.Pregunta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PreguntaRepository extends JpaRepository<Pregunta, Long> {

    // Encontrar todas las preguntas de un diseño, ordenadas
    List<Pregunta> findByDisenoIdOrderByFechaPreguntaAsc(Long disenoId);
}