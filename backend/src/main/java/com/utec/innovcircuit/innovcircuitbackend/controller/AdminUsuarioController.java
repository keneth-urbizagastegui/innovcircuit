package com.utec.innovcircuit.innovcircuitbackend.controller;

import com.utec.innovcircuit.innovcircuitbackend.dto.UsuarioAdminDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.UsuarioAdminUpdateDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.UsuarioEstadoDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.UsuarioRegistroDTO;
import com.utec.innovcircuit.innovcircuitbackend.model.Cliente;
import com.utec.innovcircuit.innovcircuitbackend.model.Proveedor;
import com.utec.innovcircuit.innovcircuitbackend.model.Usuario;
import com.utec.innovcircuit.innovcircuitbackend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/usuarios")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class AdminUsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // GET /: lista todos los usuarios (Clientes y Proveedores)
    @GetMapping("")
    public ResponseEntity<List<UsuarioAdminDTO>> listarUsuarios() {
        List<UsuarioAdminDTO> usuarios = usuarioRepository.findAll().stream()
                .filter(u -> (u instanceof Cliente) || (u instanceof Proveedor))
                .map(this::toAdminDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(usuarios);
    }

    // PUT /{id}/estado: actualiza el estado de un usuario
    @PutMapping("/{id}/estado")
    public ResponseEntity<UsuarioAdminDTO> actualizarEstado(@PathVariable Long id,
            @RequestBody UsuarioEstadoDTO estadoDTO) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new java.util.NoSuchElementException("Usuario no encontrado"));

        usuario.setEstado(estadoDTO.getEstado());
        Usuario saved = usuarioRepository.save(usuario);
        return ResponseEntity.ok(toAdminDTO(saved));
    }

    // POST /: crea un nuevo usuario (CLIENTE o PROVEEDOR)
    @PostMapping("")
    public ResponseEntity<UsuarioAdminDTO> crearUsuario(@RequestBody UsuarioRegistroDTO dto) {
        // Validar que el email no exista
        if (usuarioRepository.findByEmail(dto.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().build();
        }

        // Crear instancia según rol (CLIENTE o PROVEEDOR)
        Usuario nuevo;
        if ("PROVEEDOR".equalsIgnoreCase(dto.getRol())) {
            Proveedor p = new Proveedor();
            p.setNombre(dto.getNombre());
            p.setEmail(dto.getEmail());
            p.setEstado("ACTIVO");
            nuevo = p;
        } else {
            // default CLIENTE
            Cliente c = new Cliente();
            c.setNombre(dto.getNombre());
            c.setEmail(dto.getEmail());
            c.setEstado("ACTIVO");
            nuevo = c;
        }

        // IMPORTANTE: aquí SOLO se crea la entidad de dominio.
        // La contraseña ya viene gestionada por el flujo normal de registro;
        // como esto es demo académica, asumimos que luego el usuario hará reset de
        // contraseña.

        Usuario saved = usuarioRepository.save(nuevo);
        return ResponseEntity.ok(toAdminDTO(saved));
    }

    // PUT /{id}: actualiza nombre/email/estado de un usuario
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioAdminDTO> actualizarUsuario(
            @PathVariable Long id,
            @RequestBody UsuarioAdminUpdateDTO dto) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new java.util.NoSuchElementException("Usuario no encontrado"));

        if (dto.getNombre() != null && !dto.getNombre().isBlank()) {
            usuario.setNombre(dto.getNombre());
        }
        if (dto.getEmail() != null && !dto.getEmail().isBlank()
                && !dto.getEmail().equalsIgnoreCase(usuario.getEmail())) {
            // validar que el nuevo email no exista
            usuarioRepository.findByEmail(dto.getEmail())
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(usuario.getId())) {
                            throw new IllegalStateException("Email ya está en uso");
                        }
                    });
            usuario.setEmail(dto.getEmail());
        }
        if (dto.getEstado() != null && !dto.getEstado().isBlank()) {
            usuario.setEstado(dto.getEstado());
        }

        Usuario saved = usuarioRepository.save(usuario);
        return ResponseEntity.ok(toAdminDTO(saved));
    }

    // DELETE /{id}: elimina un usuario
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
        if (!usuarioRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        usuarioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private UsuarioAdminDTO toAdminDTO(Usuario u) {
        UsuarioAdminDTO dto = new UsuarioAdminDTO();
        dto.setId(u.getId());
        dto.setNombre(u.getNombre());
        dto.setEmail(u.getEmail());
        dto.setEstado(u.getEstado());
        String rol;
        if (u instanceof Proveedor)
            rol = "PROVEEDOR";
        else if (u instanceof Cliente)
            rol = "CLIENTE";
        else
            rol = "ADMINISTRADOR"; // no debería incluirse en listado por filtro
        dto.setRol(rol);
        return dto;
    }
}