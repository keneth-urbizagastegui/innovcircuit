package com.utec.innovcircuit.innovcircuitbackend.service;

import com.utec.innovcircuit.innovcircuitbackend.dto.PedidoRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.PedidoResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.model.Cliente;
import com.utec.innovcircuit.innovcircuitbackend.model.Diseno;
import com.utec.innovcircuit.innovcircuitbackend.model.Pedido;
import com.utec.innovcircuit.innovcircuitbackend.repository.DisenoRepository;
import com.utec.innovcircuit.innovcircuitbackend.repository.PedidoRepository;
import com.utec.innovcircuit.innovcircuitbackend.repository.UsuarioRepository;
import com.utec.innovcircuit.innovcircuitbackend.repository.VentaRepository;
import com.utec.innovcircuit.innovcircuitbackend.service.external.IFabricacionProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class PedidoServiceImpl {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private DisenoRepository disenoRepository;

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private IFabricacionProvider fabricacionProvider;

    public PedidoResponseDTO crearPedido(PedidoRequestDTO requestDTO, String emailCliente) {
        Cliente cliente = usuarioRepository.findByEmail(emailCliente, Cliente.class)
                .orElseThrow(() -> new NoSuchElementException("Cliente no encontrado"));

        Diseno diseno = disenoRepository.findById(requestDTO.getDisenoId())
                .orElseThrow(() -> new NoSuchElementException("Diseño no encontrado"));

        // Regla de Negocio: Validar que el cliente haya comprado este diseño
        long compras = ventaRepository.countByClienteIdAndDisenoId(cliente.getId(), diseno.getId());
        if (compras == 0) {
            throw new IllegalStateException("Solo puedes solicitar la impresión de diseños que has comprado.");
        }

        Pedido pedido = new Pedido();
        pedido.setCliente(cliente);
        pedido.setDiseno(diseno);
        pedido.setFechaSolicitud(LocalDateTime.now());
        pedido.setEstado("PENDIENTE_IMPRESION");
        pedido.setDireccionEnvio(requestDTO.getDireccionEnvio());
        // Calcular costo estimado de fabricación usando Strategy/Adapter
        Double costo = fabricacionProvider.cotizarFabricacion(diseno.getId());
        pedido.setCostoEnvio(costo);

        Pedido guardado = pedidoRepository.save(pedido);
        return convertToDTO(guardado);
    }

    public List<PedidoResponseDTO> getPedidosPorCliente(String emailCliente) {
        Cliente cliente = usuarioRepository.findByEmail(emailCliente, Cliente.class)
                .orElseThrow(() -> new NoSuchElementException("Cliente no encontrado"));

        return pedidoRepository.findByClienteIdOrderByFechaSolicitudDesc(cliente.getId())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // --- Nuevos métodos para gestión de pedidos por Admin ---
    public List<PedidoResponseDTO> getPedidosPorEstado(String estado) {
        List<Pedido> pedidos;
        if (estado == null || estado.isBlank() || "TODOS".equalsIgnoreCase(estado)) {
            pedidos = pedidoRepository.findAll();
        } else {
            pedidos = pedidoRepository.findAll().stream()
                    .filter(p -> estado.equalsIgnoreCase(p.getEstado()))
                    .collect(Collectors.toList());
        }
        return pedidos.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PedidoResponseDTO actualizarEstadoPedido(Long pedidoId, String nuevoEstado) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new NoSuchElementException("Pedido no encontrado"));
        // Validar que el estado sea uno de los esperados
        if (!java.util.List.of("EN_PROCESO", "ENVIADO", "ENTREGADO").contains(nuevoEstado.toUpperCase())) {
            throw new IllegalArgumentException("Estado no válido: " + nuevoEstado);
        }
        pedido.setEstado(nuevoEstado.toUpperCase());
        Pedido guardado = pedidoRepository.save(pedido);
        // --- INICIO SIMULACIÓN DE NOTIFICACIÓN ---
        System.out.println("[NOTIFICACIÓN] Pedido ID " + guardado.getId() + " actualizado a " + guardado.getEstado());
        System.out.println("  -> NOTIFICAR A CLIENTE: " + guardado.getCliente().getEmail());
        // --- FIN SIMULACIÓN ---
        return convertToDTO(guardado);
    }

    public PedidoResponseDTO confirmarOrdenFabrica(Long pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new NoSuchElementException("Pedido no encontrado"));
        String codigo = fabricacionProvider.enviarOrdenProduccion(pedido.getId(), pedido.getDireccionEnvio());
        pedido.setCodigoSeguimientoFabrica(codigo);
        pedido.setEstado("EN_PROCESO");
        Pedido guardado = pedidoRepository.save(pedido);
        return convertToDTO(guardado);
    }

    private PedidoResponseDTO convertToDTO(Pedido pedido) {
        PedidoResponseDTO dto = new PedidoResponseDTO();
        dto.setId(pedido.getId());
        dto.setFechaSolicitud(pedido.getFechaSolicitud());
        dto.setEstado(pedido.getEstado());
        dto.setDireccionEnvio(pedido.getDireccionEnvio());
        dto.setDisenoNombre(pedido.getDiseno().getNombre());
        dto.setClienteNombre(pedido.getCliente().getNombre());
        dto.setImagenUrlDiseno(pedido.getDiseno().getImagenUrl());
        dto.setCodigoSeguimientoFabrica(pedido.getCodigoSeguimientoFabrica());
        dto.setCostoEstimado(pedido.getCostoEnvio());
        return dto;
    }
}
