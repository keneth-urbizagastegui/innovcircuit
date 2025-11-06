package com.utec.innovcircuit.innovcircuitbackend.service;

import com.utec.innovcircuit.innovcircuitbackend.dto.ResenaRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.ResenaResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.model.*;
import com.utec.innovcircuit.innovcircuitbackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class ResenaServiceImpl implements IResenaService {
    @Autowired private ResenaRepository resenaRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private DisenoRepository disenoRepository;
    @Autowired private VentaRepository ventaRepository;

    @Override
    public ResenaResponseDTO crearResena(ResenaRequestDTO requestDTO, String emailCliente) {
        Cliente cliente = usuarioRepository.findByEmail(emailCliente, Cliente.class)
                .orElseThrow(() -> new NoSuchElementException("Cliente no encontrado"));

        Diseno diseno = disenoRepository.findById(requestDTO.getDisenoId())
                .orElseThrow(() -> new NoSuchElementException("Diseño no encontrado"));

        // *** REGLA DE NEGOCIO CLAVE ***
        // Verificar si el cliente compró este diseño
        long compras = ventaRepository.countByClienteIdAndDisenoId(cliente.getId(), diseno.getId());
        if (compras == 0) {
            throw new IllegalStateException("Solo puedes dejar una reseña en diseños que has comprado.");
        }

        Resena resena = new Resena();
        resena.setCalificacion(requestDTO.getCalificacion());
        resena.setComentario(requestDTO.getComentario());
        resena.setFecha(LocalDateTime.now());
        resena.setCliente(cliente);
        resena.setDiseno(diseno);
        try {
            Resena resenaGuardada = resenaRepository.save(resena);
            return convertToDTO(resenaGuardada);
        } catch (Exception e) {
            throw new IllegalStateException("Ya has dejado una reseña para este diseño.");
        }
    }

    @Override
    public List<ResenaResponseDTO> getResenasPorDiseno(Long disenoId) {
        return resenaRepository.findByDisenoId(disenoId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ResenaResponseDTO convertToDTO(Resena resena) {
        ResenaResponseDTO dto = new ResenaResponseDTO();
        dto.setId(resena.getId());
        dto.setCalificacion(resena.getCalificacion());
        dto.setComentario(resena.getComentario());
        dto.setFecha(resena.getFecha());
        dto.setNombreCliente(resena.getCliente().getNombre());
        dto.setAvatarCliente(resena.getCliente().getAvatarUrl());
        return dto;
    }
}