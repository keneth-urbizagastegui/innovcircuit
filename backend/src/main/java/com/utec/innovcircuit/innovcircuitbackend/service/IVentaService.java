package com.utec.innovcircuit.innovcircuitbackend.service;

import com.utec.innovcircuit.innovcircuitbackend.dto.CompraRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.VentaResponseDTO;

public interface IVentaService {
    VentaResponseDTO realizarCompra(CompraRequestDTO requestDTO, String emailCliente);
}