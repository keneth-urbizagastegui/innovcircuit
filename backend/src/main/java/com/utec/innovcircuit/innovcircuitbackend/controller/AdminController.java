package com.utec.innovcircuit.innovcircuitbackend.controller;

import com.utec.innovcircuit.innovcircuitbackend.dto.DisenoResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.EstadisticasAdminDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.ReporteVentasDTO;
import com.utec.innovcircuit.innovcircuitbackend.model.Configuracion;
import com.utec.innovcircuit.innovcircuitbackend.service.IDisenoService;
import com.utec.innovcircuit.innovcircuitbackend.service.IVentaService;
import com.utec.innovcircuit.innovcircuitbackend.repository.ConfiguracionRepository;
import com.utec.innovcircuit.innovcircuitbackend.service.IRetiroService;
import com.utec.innovcircuit.innovcircuitbackend.dto.RetiroResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.service.PedidoServiceImpl;
import com.utec.innovcircuit.innovcircuitbackend.dto.PedidoResponseDTO;
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
    @Autowired
    private ConfiguracionRepository configuracionRepository;
    @Autowired
    private IRetiroService retiroService;
    @Autowired
    private PedidoServiceImpl pedidoService;

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

    // Endpoint para APROBAR TODOS los diseños pendientes
    @PostMapping("/disenos/aprobar-todos")
    public ResponseEntity<java.util.Map<String, Integer>> aprobarTodosPendientes() {
        int aprobados = disenoService.aprobarTodosPendientes();
        return ResponseEntity.ok(java.util.Map.of("aprobados", aprobados));
    }

    // Endpoint para estadísticas globales de ventas y comisiones
    @GetMapping("/estadisticas")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<EstadisticasAdminDTO> getEstadisticasAdmin() {
        return ResponseEntity.ok(ventaService.getEstadisticasAdmin());
    }

    // Gestión de configuraciones
    @GetMapping("/configuracion")
    public ResponseEntity<List<Configuracion>> listarConfiguraciones() {
        return ResponseEntity.ok(configuracionRepository.findAll());
    }

    @PutMapping("/configuracion/{clave}")
    public ResponseEntity<Configuracion> actualizarConfiguracion(@PathVariable String clave,
                                                                 @RequestBody java.util.Map<String, String> body) {
        String nuevoValor = body.get("valor");
        if (nuevoValor == null) {
            return ResponseEntity.badRequest().build();
        }
        Configuracion conf = configuracionRepository.findByClave(clave)
                .orElseGet(() -> {
                    Configuracion c = new Configuracion();
                    c.setClave(clave);
                    return c;
                });
        conf.setValor(nuevoValor);
        Configuracion guardado = configuracionRepository.save(conf);
        return ResponseEntity.ok(guardado);
    }

    // Reporte detallado de ventas
    @GetMapping("/reporte/ventas")
    public ResponseEntity<ReporteVentasDTO> getReporteVentas() {
        return ResponseEntity.ok(ventaService.getReporteVentas());
    }

    // Endpoint para que el Admin vea solicitudes de retiro (ej: ?estado=PENDIENTE)
    @GetMapping("/retiros")
    public ResponseEntity<java.util.List<RetiroResponseDTO>> getRetirosPorEstado(
            @RequestParam(required = false, defaultValue = "PENDIENTE") String estado) {
        return ResponseEntity.ok(retiroService.getRetirosPorEstado(estado));
    }

    // Endpoint para que el Admin procese un retiro
    @PostMapping("/retiros/{id}/procesar")
    public ResponseEntity<RetiroResponseDTO> procesarRetiro(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        String nuevoEstado = body.get("estado");
        if (nuevoEstado == null || nuevoEstado.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(retiroService.procesarRetiro(id, nuevoEstado));
    }

    // Endpoint para que el Admin vea los pedidos de impresión (ej: ?estado=PENDIENTE_IMPRESION)
    @GetMapping("/pedidos")
    public ResponseEntity<java.util.List<PedidoResponseDTO>> getPedidosPorEstado(
            @RequestParam(required = false, defaultValue = "PENDIENTE_IMPRESION") String estado) {
        return ResponseEntity.ok(pedidoService.getPedidosPorEstado(estado));
    }

    // Endpoint para que el Admin actualice el estado de un pedido
    @PostMapping("/pedidos/{id}/actualizar-estado")
    public ResponseEntity<PedidoResponseDTO> actualizarEstadoPedido(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        String nuevoEstado = body.get("estado");
        if (nuevoEstado == null || nuevoEstado.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(pedidoService.actualizarEstadoPedido(id, nuevoEstado));
    }

    // Endpoint para enviar pedido a fábrica (confirmar orden de producción)
    @PostMapping("/pedidos/{id}/enviar-fabrica")
    public ResponseEntity<PedidoResponseDTO> enviarAFabrica(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.confirmarOrdenFabrica(id));
    }

    // Endpoint para que el Admin vea diseños APROBADOS (para poder gestionarlos)
    @GetMapping("/disenos/aprobados")
    public ResponseEntity<List<DisenoResponseDTO>> getDisenosAprobados() {
        return ResponseEntity.ok(disenoService.listarDisenosPorEstado("APROBADO"));
    }

    // Endpoint para que el Admin marque/desmarque un diseño como DESTACADO
    @PostMapping("/disenos/{id}/toggle-featured")
    public ResponseEntity<DisenoResponseDTO> toggleFeatured(@PathVariable Long id) {
        return ResponseEntity.ok(disenoService.toggleFeatured(id));
    }
}
