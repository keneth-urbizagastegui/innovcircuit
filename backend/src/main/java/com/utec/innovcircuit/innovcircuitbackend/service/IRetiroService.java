package com.utec.innovcircuit.innovcircuitbackend.service;

import com.utec.innovcircuit.innovcircuitbackend.dto.RetiroRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.RetiroResponseDTO;

import java.util.List;

public interface IRetiroService {
    RetiroResponseDTO crearRetiro(RetiroRequestDTO requestDTO, String emailProveedor);
    List<RetiroResponseDTO> getRetirosPorProveedor(String emailProveedor);
    List<RetiroResponseDTO> getRetirosPorEstado(String estado);
    RetiroResponseDTO procesarRetiro(Long retiroId, String nuevoEstado);
}