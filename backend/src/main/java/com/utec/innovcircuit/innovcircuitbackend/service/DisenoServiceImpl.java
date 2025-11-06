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

    @Override
    public DisenoResponseDTO subirDiseno(DisenoRequestDTO requestDTO, String emailProveedor) {
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

        // 4. Guardar y devolver DTO
        Diseno saved = disenoRepository.save(diseno);
        return mapToResponseDTO(saved);
    }

    @Override
    public DisenoResponseDTO subirDiseno(DisenoRequestDTO requestDTO, String emailProveedor, MultipartFile imagenFile) {
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

        // 4. Guardar archivo (si existe) y asignar imagenUrl
        String imagenUrl = fileStorageService.storeFile(imagenFile);
        if (imagenUrl != null) {
            diseno.setImagenUrl(imagenUrl);
        }

        // 5. Guardar y devolver DTO
        Diseno saved = disenoRepository.save(diseno);
        return mapToResponseDTO(saved);
    }

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

        // 4. Guardar archivos (si existen) y asignar URLs
        String imagenUrl = fileStorageService.storeFile(imagenFile);
        if (imagenUrl != null) {
            diseno.setImagenUrl(imagenUrl);
        }

        String esquematicoUrl = fileStorageService.storeFile(esquematicoFile);
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
}