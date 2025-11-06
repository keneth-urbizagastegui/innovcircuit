package com.utec.innovcircuit.innovcircuitbackend.repository;

import com.utec.innovcircuit.innovcircuitbackend.model.Diseno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisenoRepository extends JpaRepository<Diseno, Long> {
    // Buscar diseños solo si están APROBADOS
    List<Diseno> findByEstado(String estado);

    // Buscar diseños APROBADOS por nombre (búsqueda parcial, ignorando mayúsculas/minúsculas)
    List<Diseno> findByEstadoAndNombreContainingIgnoreCase(String estado, String nombre);

    // Buscar todos los diseños de un proveedor (por su ID)
    List<Diseno> findByProveedorId(Long proveedorId);
}