package com.utec.innovcircuit.innovcircuitbackend.repository;

import com.utec.innovcircuit.innovcircuitbackend.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByClienteIdOrderByFechaSolicitudDesc(Long clienteId);
}