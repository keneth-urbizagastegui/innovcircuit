package com.utec.innovcircuit.innovcircuitbackend.repository;

import com.utec.innovcircuit.innovcircuitbackend.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {
    // (Spring Data JPA se encarga del resto)
}