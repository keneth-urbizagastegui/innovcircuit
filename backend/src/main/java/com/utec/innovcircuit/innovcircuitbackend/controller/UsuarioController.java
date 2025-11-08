package com.utec.innovcircuit.innovcircuitbackend.controller;

import com.utec.innovcircuit.innovcircuitbackend.dto.DisenoResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.VentaResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.LineaVentaDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.EstadisticasProveedorDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.PerfilRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.PedidoResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.RetiroResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.service.IDisenoService;
import com.utec.innovcircuit.innovcircuitbackend.service.IVentaService;
import com.utec.innovcircuit.innovcircuitbackend.service.IUsuarioService;
import com.utec.innovcircuit.innovcircuitbackend.service.IRetiroService;
import com.utec.innovcircuit.innovcircuitbackend.service.PedidoServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/usuario")
@PreAuthorize("isAuthenticated()") // Toda esta clase es para usuarios logueados
public class UsuarioController {
    @Autowired
    private IVentaService ventaService;
    @Autowired
    private IDisenoService disenoService;
    @Autowired
    private IUsuarioService usuarioService;
    @Autowired
    private PedidoServiceImpl pedidoService;
    @Autowired
    private IRetiroService retiroService;

    // Endpoint para que el CLIENTE vea sus compras
    @GetMapping("/mis-compras")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<List<VentaResponseDTO>> getMisCompras(Principal principal) {
        return ResponseEntity.ok(ventaService.getComprasPorCliente(principal.getName()));
    }

    // Reporte completo de compras (detalle de líneas, totales y comisiones)
    @GetMapping("/reporte/mis-compras")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<List<VentaResponseDTO>> getReporteMisCompras(Principal principal) {
        return ResponseEntity.ok(ventaService.getComprasPorCliente(principal.getName()));
    }

    // Endpoint para que el PROVEEDOR vea sus diseños (todos los estados)
    @GetMapping("/mis-disenos")
    @PreAuthorize("hasRole('PROVEEDOR')")
    public ResponseEntity<List<DisenoResponseDTO>> getMisDisenos(Principal principal) {
        return ResponseEntity.ok(disenoService.getDisenosPorProveedor(principal.getName()));
    }

    // Endpoint para que el PROVEEDOR vea sus estadísticas (ventas y ganancias)
    @GetMapping("/mi-dashboard")
    @PreAuthorize("hasRole('PROVEEDOR')")
    public ResponseEntity<EstadisticasProveedorDTO> getMiDashboard(Principal principal) {
        return ResponseEntity.ok(ventaService.getEstadisticasProveedor(principal.getName()));
    }

    // Gestión de perfil propio
    @PutMapping("/mi-perfil")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> actualizarMiPerfil(@RequestBody PerfilRequestDTO dto,
                                                   Principal principal) {
        usuarioService.actualizarPerfil(principal.getName(), dto);
        return ResponseEntity.ok().build();
    }

    // Endpoint para que el CLIENTE vea sus pedidos de impresión
    @GetMapping("/mis-pedidos")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<List<PedidoResponseDTO>> getMisPedidos(Principal principal) {
        return ResponseEntity.ok(pedidoService.getPedidosPorCliente(principal.getName()));
    }

    // Endpoint para que el PROVEEDOR vea su historial de transacciones (líneas de venta)
    @GetMapping("/mis-transacciones")
    @PreAuthorize("hasRole('PROVEEDOR')")
    public ResponseEntity<List<LineaVentaDTO>> getMisTransacciones(Principal principal) {
        return ResponseEntity.ok(ventaService.getTransaccionesPorProveedor(principal.getName()));
    }

    // Endpoint para que el PROVEEDOR vea su historial de retiros
    @GetMapping("/mis-retiros")
    @PreAuthorize("hasRole('PROVEEDOR')")
    public ResponseEntity<List<RetiroResponseDTO>> getMisRetiros(Principal principal) {
        return ResponseEntity.ok(retiroService.getRetirosPorProveedor(principal.getName()));
    }
}