package com.utec.innovcircuit.innovcircuitbackend.service;

import com.utec.innovcircuit.innovcircuitbackend.dto.DisenoRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.DisenoResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.model.Categoria;
import com.utec.innovcircuit.innovcircuitbackend.model.Diseno;
import com.utec.innovcircuit.innovcircuitbackend.model.Proveedor;
import com.utec.innovcircuit.innovcircuitbackend.repository.CategoriaRepository;
import com.utec.innovcircuit.innovcircuitbackend.repository.DisenoRepository;
import com.utec.innovcircuit.innovcircuitbackend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class DisenoServiceImpl implements IDisenoService {

    @Autowired
    private DisenoRepository disenoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private FileStorageService fileStorageService;

    // Eliminadas variantes sobrecargadas: usamos un solo método con archivos opcionales

    @Override
    public DisenoResponseDTO subirDiseno(DisenoRequestDTO requestDTO, String emailProveedor,
                                         MultipartFile imagenFile,
                                         MultipartFile esquematicoFile) {
        // 1. Buscar categoría
        Categoria categoria = categoriaRepository.findById(requestDTO.getCategoriaId())
                .orElseThrow(() -> new NoSuchElementException("Categoría no encontrada"));

        // 2. Buscar proveedor por email (desde el token)
        Proveedor proveedor = usuarioRepository.findByEmail(emailProveedor, Proveedor.class)
                .orElseThrow(() -> new NoSuchElementException("Proveedor no encontrado"));

        // 3. Crear entidad Diseno con estado PENDIENTE
        Diseno diseno = new Diseno();
        diseno.setNombre(requestDTO.getNombre());
        diseno.setDescripcion(requestDTO.getDescripcion());
        diseno.setPrecio(requestDTO.getPrecio());
        diseno.setGratuito(requestDTO.isGratuito());
        diseno.setEstado("PENDIENTE");
        diseno.setCategoria(categoria);
        diseno.setProveedor(proveedor);

        // 4. Guardar archivos SOLO si no son nulos ni vacíos y asignar URLs
        String imagenUrl = null;
        if (imagenFile != null && !imagenFile.isEmpty()) {
            imagenUrl = fileStorageService.storeFile(imagenFile);
        }
        if (imagenUrl != null) {
            diseno.setImagenUrl(imagenUrl);
        }

        String esquematicoUrl = null;
        if (esquematicoFile != null && !esquematicoFile.isEmpty()) {
            esquematicoUrl = fileStorageService.storeFile(esquematicoFile);
        }
        if (esquematicoUrl != null) {
            diseno.setEsquematicoUrl(esquematicoUrl);
        }

        // 5. Guardar y devolver DTO
        Diseno saved = disenoRepository.save(diseno);
        return mapToResponseDTO(saved);
    }

    @Override
    public DisenoResponseDTO aprobarDiseno(Long disenoId) {
        Diseno diseno = disenoRepository.findById(disenoId)
                .orElseThrow(() -> new NoSuchElementException("Diseño no encontrado"));

        diseno.setEstado("APROBADO");
        Diseno saved = disenoRepository.save(diseno);
        return mapToResponseDTO(saved);
    }

    @Override
    public List<DisenoResponseDTO> listarDisenosAprobados() {
        return disenoRepository.findByEstado("APROBADO")
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DisenoResponseDTO getDisenoById(Long disenoId) {
        Diseno diseno = disenoRepository.findById(disenoId)
                .orElseThrow(() -> new NoSuchElementException("Diseño no encontrado"));
        return mapToResponseDTO(diseno);
    }

    @Override
    @Transactional
    public void darLike(Long disenoId) {
        Diseno diseno = disenoRepository.findById(disenoId)
                .orElseThrow(() -> new NoSuchElementException("Diseño no encontrado"));
        // Lógica simple de incremento
        diseno.setLikesCount(diseno.getLikesCount() + 1);
        disenoRepository.save(diseno);
    }

    @Override
    @Transactional
    public String registrarDescarga(Long disenoId) {
        Diseno diseno = disenoRepository.findById(disenoId)
                .orElseThrow(() -> new NoSuchElementException("Diseño no encontrado"));
        // Lógica simple de incremento
        diseno.setDescargasCount(diseno.getDescargasCount() + 1);
        disenoRepository.save(diseno);
        // Devuelve la URL del archivo para que el frontend lo descargue
        return diseno.getEsquematicoUrl();
    }

    // Conversión de Entidad a DTO de respuesta
    private DisenoResponseDTO mapToResponseDTO(Diseno diseno) {
        DisenoResponseDTO dto = new DisenoResponseDTO();
        dto.setId(diseno.getId());
        dto.setNombre(diseno.getNombre());
        dto.setDescripcion(diseno.getDescripcion());
        dto.setPrecio(diseno.getPrecio());
        dto.setGratuito(diseno.isGratuito());
        dto.setEstado(diseno.getEstado());
        dto.setImagenUrl(diseno.getImagenUrl());
        dto.setEsquematicoUrl(diseno.getEsquematicoUrl());
        dto.setNombreCategoria(diseno.getCategoria() != null ? diseno.getCategoria().getNombre() : null);

        // Nuevas estadísticas
        dto.setLikesCount(diseno.getLikesCount());
        dto.setDescargasCount(diseno.getDescargasCount());

        // Proveedor anidado
        if (diseno.getProveedor() != null) {
            com.utec.innovcircuit.innovcircuitbackend.dto.ProveedorDTO provDTO = new com.utec.innovcircuit.innovcircuitbackend.dto.ProveedorDTO();
            provDTO.setId(diseno.getProveedor().getId());
            provDTO.setNombre(diseno.getProveedor().getNombre());
            provDTO.setAvatarUrl(diseno.getProveedor().getAvatarUrl());
            dto.setProveedor(provDTO);
        }

        return dto;
    }

    // --- Nuevas funcionalidades de Administración ---
    @Override
    public List<DisenoResponseDTO> listarDisenosPorEstado(String estado) {
        return disenoRepository.findByEstado(estado)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DisenoResponseDTO rechazarDiseno(Long disenoId) {
        Diseno diseno = disenoRepository.findById(disenoId)
                .orElseThrow(() -> new NoSuchElementException("Diseño no encontrado"));

        diseno.setEstado("RECHAZADO");
        Diseno saved = disenoRepository.save(diseno);
        return mapToResponseDTO(saved);
    }

    // Historial del proveedor: todos sus diseños
    @Override
    public List<DisenoResponseDTO> getDisenosPorProveedor(String emailProveedor) {
        Proveedor proveedor = usuarioRepository.findByEmail(emailProveedor, Proveedor.class)
                .orElseThrow(() -> new NoSuchElementException("Proveedor no encontrado"));

        return disenoRepository.findByProveedorId(proveedor.getId())
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    // --- Gestión de Diseños (Proveedor) ---
    @Override
    @Transactional
    public DisenoResponseDTO editarDiseno(Long disenoId, DisenoRequestDTO requestDTO, String emailProveedor) {
        // 1. Buscar diseño
        Diseno diseno = disenoRepository.findById(disenoId)
                .orElseThrow(() -> new NoSuchElementException("Diseño no encontrado"));

        // 2. Buscar proveedor autenticado
        Proveedor proveedor = usuarioRepository.findByEmail(emailProveedor, Proveedor.class)
                .orElseThrow(() -> new NoSuchElementException("Proveedor no encontrado"));

        // 3. Validación de propiedad
        if (diseno.getProveedor() == null || !diseno.getProveedor().getId().equals(proveedor.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No autorizado: el diseño no pertenece al proveedor autenticado");
        }

        // 4. Actualizar campos
        diseno.setNombre(requestDTO.getNombre());
        diseno.setDescripcion(requestDTO.getDescripcion());
        diseno.setPrecio(requestDTO.getPrecio());
        diseno.setGratuito(requestDTO.isGratuito());

        // 5. Actualizar categoría
        Categoria categoria = categoriaRepository.findById(requestDTO.getCategoriaId())
                .orElseThrow(() -> new NoSuchElementException("Categoría no encontrada"));
        diseno.setCategoria(categoria);

        // 6. Guardar
        Diseno saved = disenoRepository.save(diseno);
        return mapToResponseDTO(saved);
    }

    @Override
    @Transactional
    public void eliminarDiseno(Long disenoId, String emailProveedor) {
        // 1. Buscar diseño
        Diseno diseno = disenoRepository.findById(disenoId)
                .orElseThrow(() -> new NoSuchElementException("Diseño no encontrado"));

        // 2. Buscar proveedor autenticado
        Proveedor proveedor = usuarioRepository.findByEmail(emailProveedor, Proveedor.class)
                .orElseThrow(() -> new NoSuchElementException("Proveedor no encontrado"));

        // 3. Validación de propiedad
        if (diseno.getProveedor() == null || !diseno.getProveedor().getId().equals(proveedor.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No autorizado: el diseño no pertenece al proveedor autenticado");
        }

        // 4. Eliminar
        disenoRepository.delete(diseno);
    }
}