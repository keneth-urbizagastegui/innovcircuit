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
    private static final double TASA_COMISION = 0.20; // 20%
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

        // 3. Calcular Total (ignorando gratuitos)
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

        // 6. Crear las Lineas de Venta con cálculo de comisiones
        for (Diseno diseno : disenos) {
            LineaVenta linea = new LineaVenta();
            linea.setDiseno(diseno);
            // Si es gratuito, el precio efectivo para comisión es 0
            double precio = diseno.isGratuito() ? 0.0 : diseno.getPrecio();
            double comision = precio * TASA_COMISION;
            double montoProv = precio - comision;
            linea.setPrecioAlComprar(precio);
            linea.setComisionPlataforma(comision);
            linea.setMontoProveedor(montoProv);
            linea.setVenta(venta); // Asignar la venta padre
            venta.getLineasVenta().add(linea); // Añadir la línea a la venta
        }

        // 6.1 Calcular totales de comisiones y montos para la venta
        double totalComisiones = venta.getLineasVenta().stream()
                .mapToDouble(LineaVenta::getComisionPlataforma)
                .sum();
        double totalProveedor = venta.getLineasVenta().stream()
                .mapToDouble(LineaVenta::getMontoProveedor)
                .sum();
        venta.setComisionTotal(totalComisiones);
        venta.setMontoProveedorTotal(totalProveedor);

        // 7. Guardar Venta (Cascade.ALL guardará las líneas también)
        Venta ventaGuardada = ventaRepository.save(venta);

        // 8. Convertir a DTO y devolver
        return convertToDTO(ventaGuardada);
    }

    @Override
    public com.utec.innovcircuit.innovcircuitbackend.dto.EstadisticasProveedorDTO getEstadisticasProveedor(String emailProveedor) {
        Proveedor proveedor = usuarioRepository.findByEmail(emailProveedor, Proveedor.class)
                .orElseThrow(() -> new NoSuchElementException("Proveedor no encontrado"));

        double totalVendido = 0.0;
        double gananciaNeta = 0.0;

        for (Venta v : ventaRepository.findAll()) {
            for (LineaVenta lv : v.getLineasVenta()) {
                if (lv.getDiseno() != null && lv.getDiseno().getProveedor() != null
                        && lv.getDiseno().getProveedor().getId().equals(proveedor.getId())) {
                    totalVendido += (lv.getPrecioAlComprar() != null ? lv.getPrecioAlComprar() : 0.0);
                    gananciaNeta += (lv.getMontoProveedor() != null ? lv.getMontoProveedor() : 0.0);
                }
            }
        }

        com.utec.innovcircuit.innovcircuitbackend.dto.EstadisticasProveedorDTO dto = new com.utec.innovcircuit.innovcircuitbackend.dto.EstadisticasProveedorDTO();
        dto.setTotalVendido(totalVendido);
        dto.setGananciaNeta(gananciaNeta);
        return dto;
    }

    @Override
    public com.utec.innovcircuit.innovcircuitbackend.dto.EstadisticasAdminDTO getEstadisticasAdmin() {
        double totalVentasGlobal = ventaRepository.findAll().stream()
                .mapToDouble(v -> v.getMontoTotal() != null ? v.getMontoTotal() : 0.0)
                .sum();
        double totalComisiones = ventaRepository.findAll().stream()
                .mapToDouble(v -> v.getComisionTotal() != null ? v.getComisionTotal() : 0.0)
                .sum();
        com.utec.innovcircuit.innovcircuitbackend.dto.EstadisticasAdminDTO dto = new com.utec.innovcircuit.innovcircuitbackend.dto.EstadisticasAdminDTO();
        dto.setTotalVentasGlobal(totalVentasGlobal);
        dto.setTotalComisiones(totalComisiones);
        return dto;
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

    // Historial del cliente: todas sus compras
    @Override
    public List<VentaResponseDTO> getComprasPorCliente(String emailCliente) {
        Cliente cliente = usuarioRepository.findByEmail(emailCliente, Cliente.class)
                .orElseThrow(() -> new NoSuchElementException("Cliente no encontrado"));

        return ventaRepository.findByClienteId(cliente.getId())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}