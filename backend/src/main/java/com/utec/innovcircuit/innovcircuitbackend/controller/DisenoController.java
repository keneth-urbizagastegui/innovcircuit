package com.utec.innovcircuit.innovcircuitbackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.utec.innovcircuit.innovcircuitbackend.dto.DisenoRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.DisenoResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.service.IDisenoService;
import com.utec.innovcircuit.innovcircuitbackend.service.IResenaService;
import com.utec.innovcircuit.innovcircuitbackend.dto.ResenaResponseDTO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/disenos")
public class DisenoController {

    @Autowired
    private IDisenoService disenoService;
    @Autowired
    private IResenaService resenaService;

    // RF-6, RF-9: Para todos los usuarios logueados
    @GetMapping
    public ResponseEntity<List<DisenoResponseDTO>> listarDisenos() {
        return ResponseEntity.ok(disenoService.listarDisenosAprobados());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DisenoResponseDTO> getDisenoPorId(@PathVariable Long id) {
        return ResponseEntity.ok(disenoService.getDisenoById(id));
    }

    // RF-20, RF-21: Solo para Proveedores - multipart/form-data
    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @PreAuthorize("hasRole('PROVEEDOR')")
    public ResponseEntity<DisenoResponseDTO> subirDiseno(
            @RequestParam("disenoDTO") String disenoRequestDTOString,
            @RequestPart(value = "imagenFile", required = false) MultipartFile imagenFile,
            @RequestPart(value = "esquematicoFile", required = false) MultipartFile esquematicoFile,
            Principal principal) {
        try {
            // Convertir el String DTO de vuelta a un objeto Java
            ObjectMapper objectMapper = new ObjectMapper();
            DisenoRequestDTO requestDTO = objectMapper.readValue(disenoRequestDTOString, DisenoRequestDTO.class);

            // 'Principal' nos da el usuario (email) desde el token JWT
            String emailProveedor = principal.getName();

            DisenoResponseDTO response = disenoService.subirDiseno(requestDTO, emailProveedor, imagenFile, esquematicoFile);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new RuntimeException("Error al procesar la subida: " + e.getMessage());
        }
    }

    // RF-30: Solo para Administradores
    @PostMapping("/{id}/aprobar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<DisenoResponseDTO> aprobarDiseno(@PathVariable Long id) {
        return ResponseEntity.ok(disenoService.aprobarDiseno(id));
    }

    // Endpoint para dar LIKE
    @PostMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> darLike(@PathVariable Long id) {
        disenoService.darLike(id);
        return ResponseEntity.ok().build();
    }

    // Endpoint para DESCARGAR
    @PostMapping("/{id}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> registrarDescarga(@PathVariable Long id) {
        String url = disenoService.registrarDescarga(id);
        String safeUrl = (url != null) ? url : ""; // evitar NPE con Map.of
        Map<String, String> response = Map.of("url", safeUrl);
        return ResponseEntity.ok(response);
    }

    // Endpoint PÚBLICO: obtener reseñas de un diseño (ubicado aquí para alinearse con rutas públicas de /disenos/**)
    @GetMapping("/{disenoId}/resenas")
    public ResponseEntity<List<ResenaResponseDTO>> getResenasPorDiseno(@PathVariable Long disenoId) {
        return ResponseEntity.ok(resenaService.getResenasPorDiseno(disenoId));
    }

    // PUT /{id}: Editar diseño (solo PROVEEDOR y dueño del diseño)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PROVEEDOR')")
    public ResponseEntity<DisenoResponseDTO> editarDiseno(@PathVariable Long id,
                                                          @Valid @RequestBody DisenoRequestDTO requestDTO,
                                                          Principal principal) {
        String emailProveedor = principal.getName();
        return ResponseEntity.ok(disenoService.editarDiseno(id, requestDTO, emailProveedor));
    }

    // DELETE /{id}: Eliminar diseño (solo PROVEEDOR y dueño del diseño)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PROVEEDOR')")
    public ResponseEntity<Void> eliminarDiseno(@PathVariable Long id, Principal principal) {
        String emailProveedor = principal.getName();
        disenoService.eliminarDiseno(id, emailProveedor);
        return ResponseEntity.noContent().build();
    }
}