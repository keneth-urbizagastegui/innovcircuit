package com.utec.innovcircuit.innovcircuitbackend.service;

import com.utec.innovcircuit.innovcircuitbackend.dto.EstadisticasProveedorDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.RetiroRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.RetiroResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.model.Proveedor;
import com.utec.innovcircuit.innovcircuitbackend.model.Retiro;
import com.utec.innovcircuit.innovcircuitbackend.repository.RetiroRepository;
import com.utec.innovcircuit.innovcircuitbackend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class RetiroServiceImpl implements IRetiroService {

    @Autowired
    private RetiroRepository retiroRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private IVentaService ventaService; // Para consultar saldo

    @Override
    public RetiroResponseDTO crearRetiro(RetiroRequestDTO requestDTO, String emailProveedor) {
        Proveedor proveedor = usuarioRepository.findByEmail(emailProveedor, Proveedor.class)
                .orElseThrow(() -> new NoSuchElementException("Proveedor no encontrado"));

        // 1. Validar Saldo Disponible
        EstadisticasProveedorDTO estadisticas = ventaService.getEstadisticasProveedor(emailProveedor);
        double saldoDisponible = estadisticas.getSaldoDisponible();
        if (requestDTO.getMonto() > saldoDisponible) {
            throw new IllegalStateException("Fondos insuficientes. Saldo disponible: " + saldoDisponible);
        }

        // 2. Crear la solicitud de retiro
        Retiro retiro = new Retiro();
        retiro.setProveedor(proveedor);
        retiro.setMonto(requestDTO.getMonto());
        retiro.setMetodoPago(requestDTO.getMetodoPago());
        retiro.setEstado("PENDIENTE");
        retiro.setFechaSolicitud(LocalDateTime.now());

        Retiro guardado = retiroRepository.save(retiro);
        return convertToDTO(guardado);
    }

    @Override
    public List<RetiroResponseDTO> getRetirosPorProveedor(String emailProveedor) {
        Proveedor proveedor = usuarioRepository.findByEmail(emailProveedor, Proveedor.class)
                .orElseThrow(() -> new NoSuchElementException("Proveedor no encontrado"));

        return retiroRepository.findByProveedorIdOrderByFechaSolicitudDesc(proveedor.getId())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<RetiroResponseDTO> getRetirosPorEstado(String estado) {
        // Si el estado es "TODOS" o nulo, buscar todos.
        if (estado == null || estado.isBlank() || "TODOS".equalsIgnoreCase(estado)) {
            return retiroRepository.findAll()
                    .stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        }
        // Buscar por un estado específico
        return retiroRepository.findAll().stream()
                .filter(r -> estado.equalsIgnoreCase(r.getEstado()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public RetiroResponseDTO procesarRetiro(Long retiroId, String nuevoEstado) {
        Retiro retiro = retiroRepository.findById(retiroId)
                .orElseThrow(() -> new NoSuchElementException("Solicitud de retiro no encontrada"));
        if (!"APROBADO".equalsIgnoreCase(nuevoEstado) && !"RECHAZADO".equalsIgnoreCase(nuevoEstado)) {
            throw new IllegalArgumentException("El nuevo estado debe ser 'APROBADO' o 'RECHAZADO'");
        }
        retiro.setEstado(nuevoEstado.toUpperCase());
        retiro.setFechaProcesado(LocalDateTime.now());
        // IMPORTANTE: Si se rechaza, el dinero vuelve a estar disponible automáticamente
        // gracias a la lógica de getEstadisticasProveedor (que solo suma los NO RECHAZADOS).
        Retiro guardado = retiroRepository.save(retiro);
        // --- INICIO SIMULACIÓN DE NOTIFICACIÓN ---
        System.out.println("[NOTIFICACIÓN] Solicitud de retiro actualizada ID " + guardado.getId() + " a " + guardado.getEstado());
        System.out.println("  -> NOTIFICAR A PROVEEDOR: " + guardado.getProveedor().getEmail());
        // --- FIN SIMULACIÓN ---
        return convertToDTO(guardado);
    }

    private RetiroResponseDTO convertToDTO(Retiro retiro) {
        RetiroResponseDTO dto = new RetiroResponseDTO();
        dto.setId(retiro.getId());
        dto.setMonto(retiro.getMonto());
        dto.setEstado(retiro.getEstado());
        dto.setFechaSolicitud(retiro.getFechaSolicitud());
        dto.setFechaProcesado(retiro.getFechaProcesado());
        dto.setMetodoPago(retiro.getMetodoPago());
        return dto;
    }
}