package com.utec.innovcircuit.innovcircuitbackend.controller;

import com.utec.innovcircuit.innovcircuitbackend.dto.DisenoResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.VentaResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.EstadisticasProveedorDTO;
import com.utec.innovcircuit.innovcircuitbackend.service.IDisenoService;
import com.utec.innovcircuit.innovcircuitbackend.service.IVentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
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

    // Endpoint para que el CLIENTE vea sus compras
    @GetMapping("/mis-compras")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<List<VentaResponseDTO>> getMisCompras(Principal principal) {
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
}