package com.utec.innovcircuit.innovcircuitbackend.controller;

import com.utec.innovcircuit.innovcircuitbackend.model.LineaVenta;
import com.utec.innovcircuit.innovcircuitbackend.service.ReclamoService;
import com.utec.innovcircuit.innovcircuitbackend.repository.LineaVentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
public class ReclamoController {
    @Autowired
    private ReclamoService reclamoService;

    @Autowired
    private LineaVentaRepository lineaVentaRepository;

    @PostMapping("/reclamos")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<Map<String, String>> crearReclamo(@RequestBody Map<String, String> body, Principal principal) {
        Long lineaVentaId = Long.valueOf(body.get("lineaVentaId"));
        String motivo = body.get("motivo");
        reclamoService.iniciarReclamo(lineaVentaId, motivo, principal.getName());
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @PostMapping("/admin/reclamos/{id}/resolver")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Map<String, String>> resolverReclamo(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        boolean aceptar = Boolean.TRUE.equals(body.get("aceptarReembolso"));
        reclamoService.resolverReclamo(id, aceptar);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @GetMapping("/admin/reclamos")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<Map<String, Object>>> listarReclamos() {
        List<Map<String, Object>> list = lineaVentaRepository.findAll().stream()
                .filter(lv -> "EN_RECLAMO".equals(lv.getEstadoFinanciero()))
                .map(lv -> {
                    java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
                    m.put("id", lv.getId());
                    m.put("disenoNombre", lv.getDiseno() != null ? lv.getDiseno().getNombre() : null);
                    m.put("clienteNombre", lv.getVenta() != null && lv.getVenta().getCliente() != null ? lv.getVenta().getCliente().getNombre() : null);
                    m.put("proveedorNombre", lv.getDiseno() != null && lv.getDiseno().getProveedor() != null ? lv.getDiseno().getProveedor().getNombre() : null);
                    m.put("fechaVenta", lv.getVenta() != null ? lv.getVenta().getFecha() : null);
                    m.put("montoProveedor", lv.getMontoProveedor());
                    m.put("motivoReclamo", lv.getMotivoReclamo());
                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }
}
