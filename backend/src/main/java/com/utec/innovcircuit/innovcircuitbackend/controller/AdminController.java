package com.utec.innovcircuit.innovcircuitbackend.controller;

import com.utec.innovcircuit.innovcircuitbackend.dto.DisenoResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.EstadisticasAdminDTO;
import com.utec.innovcircuit.innovcircuitbackend.service.IDisenoService;
import com.utec.innovcircuit.innovcircuitbackend.service.IVentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMINISTRADOR')") // ¡Protege toda la clase!
public class AdminController {
    @Autowired
    private IDisenoService disenoService;
    @Autowired
    private IVentaService ventaService;

    // Endpoint para ver diseños PENDIENTES
    @GetMapping("/disenos/pendientes")
    public ResponseEntity<List<DisenoResponseDTO>> getDisenosPendientes() {
        return ResponseEntity.ok(disenoService.listarDisenosPorEstado("PENDIENTE"));
    }

    // Endpoint para RECHAZAR un diseño
    @PostMapping("/disenos/{id}/rechazar")
    public ResponseEntity<DisenoResponseDTO> rechazarDiseno(@PathVariable Long id) {
        return ResponseEntity.ok(disenoService.rechazarDiseno(id));
    }

    // Nota: El endpoint para APROBAR ('/api/v1/disenos/{id}/aprobar')
    // ya existe en DisenoController y está protegido para ADMIN.

    // Endpoint para estadísticas globales de ventas y comisiones
    @GetMapping("/estadisticas")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<EstadisticasAdminDTO> getEstadisticasAdmin() {
        return ResponseEntity.ok(ventaService.getEstadisticasAdmin());
    }
}