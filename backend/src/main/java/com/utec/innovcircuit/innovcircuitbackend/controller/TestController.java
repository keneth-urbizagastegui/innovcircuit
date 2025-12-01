package com.utec.innovcircuit.innovcircuitbackend.controller;

import com.utec.innovcircuit.innovcircuitbackend.model.LineaVenta;
import com.utec.innovcircuit.innovcircuitbackend.model.Venta;
import com.utec.innovcircuit.innovcircuitbackend.repository.LineaVentaRepository;
import com.utec.innovcircuit.innovcircuitbackend.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/test")
@PreAuthorize("isAuthenticated()") // Requiere que esté logueado para toda la clase
public class TestController {

    @Autowired
    private LineaVentaRepository lineaVentaRepository;

    @Autowired
    private VentaRepository ventaRepository;

    @GetMapping("/todos")
    public ResponseEntity<String> getParaTodos() {
        return ResponseEntity.ok("Este endpoint es para TODOS los usuarios logueados.");
    }

    @GetMapping("/cliente")
    @PreAuthorize("hasRole('CLIENTE')") // ¡Solo ROLE_CLIENTE!
    public ResponseEntity<String> getParaCliente() {
        return ResponseEntity.ok("¡Éxito! Eres un CLIENTE.");
    }

    @GetMapping("/proveedor")
    @PreAuthorize("hasRole('PROVEEDOR')") // ¡Solo ROLE_PROVEEDOR!
    public ResponseEntity<String> getParaProveedor() {
        return ResponseEntity.ok("¡Éxito! Eres un PROVEEDOR.");
    }

    @PostMapping("/time-travel")
    public ResponseEntity<String> timeTravel(@RequestParam(value = "dias", required = false) Integer diasParam,
                                             @RequestBody(required = false) Map<String, Integer> body) {
        Integer dias = diasParam != null ? diasParam : (body != null ? body.get("dias") : null);
        if (dias == null || dias <= 0) {
            return ResponseEntity.badRequest().body("Parámetro 'dias' requerido y mayor a 0.");
        }

        List<Venta> ventas = ventaRepository.findAll();
        for (Venta v : ventas) {
            if (v.getFecha() != null) {
                v.setFecha(v.getFecha().minusDays(dias));
            }
            if (v.getLineasVenta() != null) {
                for (LineaVenta lv : v.getLineasVenta()) {
                    if (lv.getFechaLiberacion() != null) {
                        lv.setFechaLiberacion(lv.getFechaLiberacion().minusDays(dias));
                    }
                }
            }
        }
        ventaRepository.saveAll(ventas);

        List<LineaVenta> lineas = lineaVentaRepository.findAll();
        for (LineaVenta lv : lineas) {
            if (lv.getFechaLiberacion() != null) {
                lv.setFechaLiberacion(lv.getFechaLiberacion().minusDays(dias));
            }
        }
        lineaVentaRepository.saveAll(lineas);

        return ResponseEntity.ok("¡Viaje en el tiempo realizado! Se han adelantado las fechas en " + dias + " días.");
    }
}
