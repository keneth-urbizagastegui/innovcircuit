package com.utec.innovcircuit.innovcircuitbackend.service;

import com.utec.innovcircuit.innovcircuitbackend.dto.EstadisticasProveedorDTO;
import com.utec.innovcircuit.innovcircuitbackend.model.*;
import com.utec.innovcircuit.innovcircuitbackend.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class VentaServiceTest {

    @Mock
    private VentaRepository ventaRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private RetiroRepository retiroRepository;
    @Mock
    private LineaVentaRepository lineaVentaRepository;
    @Mock
    private ConfiguracionRepository configuracionRepository;
    @Mock
    private DisenoRepository disenoRepository;

    @InjectMocks
    private VentaServiceImpl ventaService;

    @Test
    void getEstadisticasProveedor_calculaSaldosCorrectamente() {
        // Proveedor ficticio
        Proveedor proveedor = new Proveedor();
        proveedor.setId(1L);
        proveedor.setEmail("prov@demo.com");

        when(usuarioRepository.findByEmail("prov@demo.com")).thenReturn(Optional.of(proveedor));

        // Venta A: hace 8 días, liberación hace 1 día (disponible)
        Venta ventaA = new Venta();
        ventaA.setFecha(LocalDateTime.now().minusDays(8));

        Diseno disenoA = new Diseno();
        disenoA.setProveedor(proveedor);

        LineaVenta lineaA = new LineaVenta();
        lineaA.setDiseno(disenoA);
        lineaA.setPrecioAlComprar(100.0);
        lineaA.setMontoProveedor(100.0);
        lineaA.setVenta(ventaA);
        lineaA.setFechaLiberacion(ventaA.getFecha().plusDays(7)); // liberado

        ventaA.setLineasVenta(new java.util.ArrayList<>(List.of(lineaA)));

        // Venta B: ayer, liberación en 6 días (pendiente)
        Venta ventaB = new Venta();
        ventaB.setFecha(LocalDateTime.now().minusDays(1));

        Diseno disenoB = new Diseno();
        disenoB.setProveedor(proveedor);

        LineaVenta lineaB = new LineaVenta();
        lineaB.setDiseno(disenoB);
        lineaB.setPrecioAlComprar(50.0);
        lineaB.setMontoProveedor(50.0);
        lineaB.setVenta(ventaB);
        lineaB.setFechaLiberacion(ventaB.getFecha().plusDays(7)); // aún pendiente

        ventaB.setLineasVenta(new java.util.ArrayList<>(List.of(lineaB)));

        // Venta C: reembolsada, ignorar monto
        Venta ventaC = new Venta();
        ventaC.setFecha(LocalDateTime.now().minusDays(3));

        Diseno disenoC = new Diseno();
        disenoC.setProveedor(proveedor);

        LineaVenta lineaC = new LineaVenta();
        lineaC.setDiseno(disenoC);
        lineaC.setPrecioAlComprar(200.0);
        lineaC.setMontoProveedor(200.0);
        lineaC.setVenta(ventaC);
        lineaC.setEstadoFinanciero("REEMBOLSADO");
        lineaC.setFechaLiberacion(ventaC.getFecha().plusDays(7));

        ventaC.setLineasVenta(new java.util.ArrayList<>(List.of(lineaC)));

        when(ventaRepository.findAll()).thenReturn(List.of(ventaA, ventaB, ventaC));
        when(retiroRepository.sumMontoByProveedorIdAndEstadoNotRechazado(1L)).thenReturn(0.0);

        EstadisticasProveedorDTO dto = ventaService.getEstadisticasProveedor("prov@demo.com");

        assertNotNull(dto);
        // Disponible: 100
        assertEquals(100.0, dto.getSaldoDisponible(), 0.0001);
        // Pendiente: 50
        assertEquals(50.0, dto.getSaldoPendiente(), 0.0001);
        // Reembolsado ignorado
        assertEquals(0.0, dto.getSaldoEnDisputa(), 0.0001);
        // Ganancia neta histórica debe reflejar liberados
        assertTrue(dto.getGananciaNeta() >= 100.0 - 1e-6);
    }
}
