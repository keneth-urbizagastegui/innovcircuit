package com.utec.innovcircuit.innovcircuitbackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.utec.innovcircuit.innovcircuitbackend.dto.DisenoRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.DisenoResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.ResenaResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.service.IDisenoService;
import com.utec.innovcircuit.innovcircuitbackend.service.IResenaService;
import com.utec.innovcircuit.innovcircuitbackend.service.FileStorageService;
import com.utec.innovcircuit.innovcircuitbackend.service.AutoImageService;
import com.utec.innovcircuit.innovcircuitbackend.model.Cliente;
import com.utec.innovcircuit.innovcircuitbackend.model.Diseno;
import com.utec.innovcircuit.innovcircuitbackend.model.Proveedor;
import com.utec.innovcircuit.innovcircuitbackend.repository.DisenoRepository;
import com.utec.innovcircuit.innovcircuitbackend.repository.UsuarioRepository;
import com.utec.innovcircuit.innovcircuitbackend.repository.VentaRepository;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
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
    @Autowired
    private FileStorageService fileStorageService;
    @Autowired
    private AutoImageService autoImageService;
    @Autowired
    private VentaRepository ventaRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private DisenoRepository disenoRepository;

    // RF-6, RF-9: Para todos los usuarios logueados, con búsqueda opcional por
    // nombre (q)
    @GetMapping
    public ResponseEntity<List<DisenoResponseDTO>> listarDisenos(
            @RequestParam(name = "q", required = false) String q,
            @RequestParam(name = "categoriaId", required = false) Long categoriaId,
            @RequestParam(name = "minPrecio", required = false) Double minPrecio,
            @RequestParam(name = "maxPrecio", required = false) Double maxPrecio) {
        return ResponseEntity.ok(disenoService.buscarDisenos(q, categoriaId, minPrecio, maxPrecio));
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
            @RequestPart(value = "imagenesFiles", required = false) java.util.List<MultipartFile> imagenesFiles,
            Principal principal) {
        try {
            // Convertir el String DTO de vuelta a un objeto Java
            ObjectMapper objectMapper = new ObjectMapper();
            DisenoRequestDTO requestDTO = objectMapper.readValue(disenoRequestDTOString, DisenoRequestDTO.class);

            // 'Principal' nos da el usuario (email) desde el token JWT
            String emailProveedor = principal.getName();

            DisenoResponseDTO response = disenoService.subirDiseno(requestDTO, emailProveedor, imagenFile,
                    esquematicoFile, imagenesFiles);
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
    @GetMapping("/{id}/archivo")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> descargarArchivo(@PathVariable Long id, Principal principal) {
        Diseno diseno = disenoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Diseño no encontrado"));

        String email = principal.getName();
        boolean esDueno = diseno.getProveedor() != null && email.equals(diseno.getProveedor().getEmail());

        boolean haComprado = false;
        Cliente cliente = usuarioRepository.findByEmail(email, Cliente.class).orElse(null);
        if (cliente != null) {
            haComprado = ventaRepository.countByClienteIdAndDisenoId(cliente.getId(), diseno.getId()) > 0;
        }

        if (!esDueno && !haComprado) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para descargar este archivo");
        }

        String fileUrl = diseno.getEsquematicoUrl() != null ? diseno.getEsquematicoUrl() : diseno.getImagenUrl();
        if (fileUrl == null || fileUrl.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Este diseño no tiene archivo disponible");
        }

        Resource resource = fileStorageService.loadFileAsResource(fileUrl);
        String filename = resource.getFilename();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    // Endpoint PÚBLICO: obtener reseñas de un diseño (ubicado aquí para alinearse
    // con rutas públicas de /disenos/**)
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

    // Endpoint PÚBLICO: obtener diseños destacados
    @GetMapping("/destacados")
    public ResponseEntity<List<DisenoResponseDTO>> getDisenosDestacados() {
        return ResponseEntity.ok(disenoService.listarDisenosDestacados());
    }

    /**
     * Endpoint para generar automáticamente una imagen para un diseño usando
     * Unsplash.
     * Solo PROVEEDOR dueño del diseño o ADMINISTRADOR pueden usarlo.
     */
    @PostMapping("/{id}/auto-imagen")
    @PreAuthorize("hasAnyRole('PROVEEDOR', 'ADMINISTRADOR')")
    public ResponseEntity<DisenoResponseDTO> generarImagenAuto(@PathVariable Long id, Principal principal) {
        Diseno diseno = disenoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Diseño no encontrado"));

        // Verificar propiedad si es proveedor
        String email = principal.getName();
        boolean esAdmin = usuarioRepository
                .findByEmail(email, com.utec.innovcircuit.innovcircuitbackend.model.Administrador.class).isPresent();
        boolean esDueno = diseno.getProveedor() != null && email.equals(diseno.getProveedor().getEmail());

        if (!esAdmin && !esDueno) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para modificar este diseño");
        }

        String ruta = autoImageService.generarImagenParaDiseno(diseno);
        if (ruta == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No se pudo generar imagen automática. Verifica que la API key de Unsplash esté configurada.");
        }

        diseno.setImagenUrl(ruta);
        disenoRepository.save(diseno);

        return ResponseEntity.ok(disenoService.getDisenoById(id));
    }
}
