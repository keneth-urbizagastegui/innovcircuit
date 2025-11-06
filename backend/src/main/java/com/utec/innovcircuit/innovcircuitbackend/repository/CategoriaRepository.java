package com.utec.innovcircuit.innovcircuitbackend.repository;

import com.utec.innovcircuit.innovcircuitbackend.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    // Spring Data JPA crea mágicamente los métodos
    // findById, save, delete, findAll, etc.
    Optional<Categoria> findByNombre(String nombre);
}