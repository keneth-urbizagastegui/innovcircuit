package com.utec.innovcircuit.innovcircuitbackend.repository;

import com.utec.innovcircuit.innovcircuitbackend.model.DisenoImagen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisenoImagenRepository extends JpaRepository<DisenoImagen, Long> {
    List<DisenoImagen> findByDisenoIdOrderByOrdenAsc(Long disenoId);
}
