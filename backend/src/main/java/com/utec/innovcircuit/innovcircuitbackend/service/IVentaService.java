package com.utec.innovcircuit.innovcircuitbackend.service;

import com.utec.innovcircuit.innovcircuitbackend.dto.CompraRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.VentaResponseDTO;
import java.util.List;

public interface IVentaService {
    VentaResponseDTO realizarCompra(CompraRequestDTO requestDTO, String emailCliente);

    // Historial del cliente: todas sus compras
    List<VentaResponseDTO> getComprasPorCliente(String emailCliente);
}