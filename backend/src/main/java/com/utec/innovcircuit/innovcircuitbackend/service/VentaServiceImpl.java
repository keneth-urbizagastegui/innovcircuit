package com.utec.innovcircuit.innovcircuitbackend.service;

import com.utec.innovcircuit.innovcircuitbackend.dto.CompraRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.VentaResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.model.*;
import com.utec.innovcircuit.innovcircuitbackend.repository.DisenoRepository;
import com.utec.innovcircuit.innovcircuitbackend.repository.UsuarioRepository;
import com.utec.innovcircuit.innovcircuitbackend.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class VentaServiceImpl implements IVentaService {
    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private DisenoRepository disenoRepository;

    // (Simulación del Servicio de Pago Externo)
    // private ServicioPagoExterno servicioPago;

    @Override
    @Transactional // Asegura que toda la compra sea una transacción (o todo o nada)
    public VentaResponseDTO realizarCompra(CompraRequestDTO requestDTO, String emailCliente) {
        // 1. Buscar al Cliente
        Cliente cliente = usuarioRepository.findByEmail(emailCliente, Cliente.class)
                .orElseThrow(() -> new NoSuchElementException("Cliente no encontrado"));

        // 2. Buscar los Diseños
        List<Diseno> disenos = disenoRepository.findAllById(requestDTO.getDisenoIds());
        if (disenos.size() != requestDTO.getDisenoIds().size()) {
            throw new NoSuchElementException("Uno o más diseños no fueron encontrados.");
        }

        // *** INICIO DE NUEVA VALIDACIÓN ***
        // Verificar que TODOS los diseños estén APROBADOS
        for (Diseno diseno : disenos) {
            if (!"APROBADO".equals(diseno.getEstado())) {
                // Lanzamos una excepción que será atrapada por el GlobalExceptionHandler
                throw new IllegalStateException("El diseño '" + diseno.getNombre() + "' (ID: " + diseno.getId() + ") no está APROBADO y no se puede comprar.");
            }
        }
        // *** FIN DE NUEVA VALIDACIÓN ***

        // 3. Calcular Total (y aplicar lógica de comisión si aplica)
        double montoTotal = disenos.stream()
                .filter(d -> !d.isGratuito()) // Ignorar gratuitos
                .mapToDouble(Diseno::getPrecio)
                .sum();

        // 4. (Simulación) Procesar pago con Pasarela Externa
        // servicioPago.procesar(montoTotal, requestDTO.getTokenPago());

        // 5. Crear la Venta
        Venta venta = new Venta();
        venta.setFecha(LocalDateTime.now());
        venta.setCliente(cliente);
        venta.setMontoTotal(montoTotal);

        // 6. Crear las Lineas de Venta
        for (Diseno diseno : disenos) {
            LineaVenta linea = new LineaVenta();
            linea.setDiseno(diseno);
            linea.setPrecioAlComprar(diseno.getPrecio());
            linea.setVenta(venta); // Asignar la venta padre
            venta.getLineasVenta().add(linea); // Añadir la línea a la venta
        }

        // 7. Guardar Venta (Cascade.ALL guardará las líneas también)
        Venta ventaGuardada = ventaRepository.save(venta);

        // 8. Convertir a DTO y devolver
        return convertToDTO(ventaGuardada);
    }

    private VentaResponseDTO convertToDTO(Venta venta) {
        VentaResponseDTO dto = new VentaResponseDTO();
        dto.setId(venta.getId());
        dto.setFecha(venta.getFecha());
        dto.setMontoTotal(venta.getMontoTotal());
        dto.setNombreCliente(venta.getCliente().getNombre());
        dto.setDisenosComprados(venta.getLineasVenta().stream()
                .map(linea -> linea.getDiseno().getNombre())
                .collect(Collectors.toList()));
        return dto;
    }
}