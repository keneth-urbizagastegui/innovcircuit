package com.utec.innovcircuit.innovcircuitbackend.repository;

import com.utec.innovcircuit.innovcircuitbackend.model.Venta;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {
    // Buscar ventas por ID de cliente
    List<Venta> findByClienteId(Long clienteId);

    // Contar ventas que contienen un clienteID y un disenoID
    @Query("SELECT COUNT(v) FROM Venta v JOIN v.lineasVenta lv WHERE v.cliente.id = :clienteId AND lv.diseno.id = :disenoId")
    long countByClienteIdAndDisenoId(Long clienteId, Long disenoId);
}