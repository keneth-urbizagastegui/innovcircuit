package com.utec.innovcircuit.innovcircuitbackend.repository;

import com.utec.innovcircuit.innovcircuitbackend.model.LineaVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LineaVentaRepository extends JpaRepository<LineaVenta, Long> {

    // Buscar todas las líneas de venta asociadas a los diseños de un proveedor
    @Query("SELECT lv FROM LineaVenta lv JOIN lv.diseno d WHERE d.proveedor.id = :proveedorId ORDER BY lv.venta.fecha DESC")
    List<LineaVenta> findByDisenoProveedorId(@Param("proveedorId") Long proveedorId);
}