package com.utec.innovcircuit.innovcircuitbackend.repository;

import com.utec.innovcircuit.innovcircuitbackend.model.Retiro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RetiroRepository extends JpaRepository<Retiro, Long> {

    List<Retiro> findByProveedorIdOrderByFechaSolicitudDesc(Long proveedorId);

    // Suma todos los retiros que no han sido rechazados (pendientes + aprobados)
    @Query("SELECT COALESCE(SUM(r.monto), 0.0) FROM Retiro r WHERE r.proveedor.id = :proveedorId AND r.estado <> 'RECHAZADO'")
    Double sumMontoByProveedorIdAndEstadoNotRechazado(@Param("proveedorId") Long proveedorId);
}