package com.utec.innovcircuit.innovcircuitbackend.controller;

import com.utec.innovcircuit.innovcircuitbackend.dto.UsuarioAdminDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.UsuarioEstadoDTO;
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
    public ResponseEntity<UsuarioAdminDTO> actualizarEstado(@PathVariable Long id, @RequestBody UsuarioEstadoDTO estadoDTO) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new java.util.NoSuchElementException("Usuario no encontrado"));

        usuario.setEstado(estadoDTO.getEstado());
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
        if (u instanceof Proveedor) rol = "PROVEEDOR";
        else if (u instanceof Cliente) rol = "CLIENTE";
        else rol = "ADMINISTRADOR"; // no debería incluirse en listado por filtro
        dto.setRol(rol);
        return dto;
    }
}