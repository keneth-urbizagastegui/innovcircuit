package com.utec.innovcircuit.innovcircuitbackend.service;

import com.utec.innovcircuit.innovcircuitbackend.model.Cliente;
import com.utec.innovcircuit.innovcircuitbackend.model.LineaVenta;
import com.utec.innovcircuit.innovcircuitbackend.repository.LineaVentaRepository;
import com.utec.innovcircuit.innovcircuitbackend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;

@Service
public class ReclamoService {
    @Autowired
    private LineaVentaRepository lineaVentaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public void iniciarReclamo(Long lineaVentaId, String motivo, String emailCliente) {
        LineaVenta lv = lineaVentaRepository.findById(lineaVentaId)
                .orElseThrow(() -> new NoSuchElementException("Línea de venta no encontrada"));
        Cliente cliente = usuarioRepository.findByEmail(emailCliente, Cliente.class)
                .orElseThrow(() -> new NoSuchElementException("Cliente no encontrado"));
        if (lv.getVenta() == null || lv.getVenta().getCliente() == null ||
                !lv.getVenta().getCliente().getId().equals(cliente.getId())) {
            throw new IllegalStateException("La línea de venta no pertenece al cliente");
        }
        LocalDateTime limite = lv.getVenta().getFecha().plusDays(7);
        if (LocalDateTime.now().isAfter(limite)) {
            throw new IllegalStateException("El periodo de reclamo ha expirado");
        }
        lv.setEstadoFinanciero("EN_RECLAMO");
        lv.setMotivoReclamo(motivo);
        lineaVentaRepository.save(lv);
    }

    public void resolverReclamo(Long lineaVentaId, boolean aceptarReembolso) {
        LineaVenta lv = lineaVentaRepository.findById(lineaVentaId)
                .orElseThrow(() -> new NoSuchElementException("Línea de venta no encontrada"));
        if (aceptarReembolso) {
            lv.setEstadoFinanciero("REEMBOLSADO");
            lv.setMontoProveedor(0.0);
        } else {
            lv.setEstadoFinanciero("PENDIENTE_LIBERACION");
        }
        lineaVentaRepository.save(lv);
    }
}
