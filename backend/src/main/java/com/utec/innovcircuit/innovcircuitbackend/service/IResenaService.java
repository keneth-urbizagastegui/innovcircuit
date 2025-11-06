package com.utec.innovcircuit.innovcircuitbackend.service;

import com.utec.innovcircuit.innovcircuitbackend.dto.ResenaRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.ResenaResponseDTO;
import java.util.List;

public interface IResenaService {
    ResenaResponseDTO crearResena(ResenaRequestDTO requestDTO, String emailCliente);
    List<ResenaResponseDTO> getResenasPorDiseno(Long disenoId);

    // Responder a una reseña (Proveedor)
    ResenaResponseDTO responderResena(Long resenaId, String emailProveedor, String respuesta);
}