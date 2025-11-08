package com.utec.innovcircuit.innovcircuitbackend.service;

import com.utec.innovcircuit.innovcircuitbackend.dto.UsuarioLoginDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.LoginResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.UsuarioRegistroDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.PerfilRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.model.Cliente;
import com.utec.innovcircuit.innovcircuitbackend.model.Proveedor;
import com.utec.innovcircuit.innovcircuitbackend.model.Administrador;
import com.utec.innovcircuit.innovcircuitbackend.model.Usuario;
import com.utec.innovcircuit.innovcircuitbackend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioServiceImpl implements IUsuarioService {
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Inyectamos el codificador

    @Autowired
    private JwtUtil jwtUtil; // Utilidad para generar JWT

    @Override
    public Usuario registrarUsuario(UsuarioRegistroDTO registroDTO) {
        // 1. Validar que el email no exista
        String emailNormalizado = registroDTO.getEmail() == null ? null : registroDTO.getEmail().trim().toLowerCase();
        if (usuarioRepository.findByEmail(emailNormalizado).isPresent()) {
            throw new RuntimeException("Error: El email ya está en uso.");
        }

        // 2. Crear la entidad correcta (Cliente, Proveedor o Administrador)
        Usuario usuario;
        if ("PROVEEDOR".equalsIgnoreCase(registroDTO.getRol())) {
            usuario = new Proveedor();
        } else if ("ADMINISTRADOR".equalsIgnoreCase(registroDTO.getRol())) {
            usuario = new Administrador();
        } else {
            usuario = new Cliente(); // Cliente por defecto
        }

        // 3. Setear datos y HASHEAR el password
        usuario.setNombre(registroDTO.getNombre());
        // Normalizar y guardar el email en minúsculas para evitar problemas de coincidencia
        usuario.setEmail(emailNormalizado);
        usuario.setPassword(passwordEncoder.encode(registroDTO.getPassword()));

        // 4. Guardar en la BD
        return usuarioRepository.save(usuario);
    }

    @Override
    public LoginResponseDTO login(UsuarioLoginDTO loginDTO) {
        // 1. Normalizar email (trim + minúsculas) y buscar al usuario
        String emailNormalizado = loginDTO.getEmail() == null ? null : loginDTO.getEmail().trim().toLowerCase();
        System.out.println("[AUTH] Intento de login para email: " + emailNormalizado);
        Usuario usuario = usuarioRepository.findByEmail(emailNormalizado)
                .orElseThrow(() -> new RuntimeException("Credenciales inválidas"));

        // 2. Comparar la contraseña del DTO con la hasheada en la BD
        if (passwordEncoder.matches(loginDTO.getPassword(), usuario.getPassword())) {
            // 3. Si coinciden, generar token JWT con el rol
            String rol;
            if (usuario instanceof Proveedor) {
                rol = "PROVEEDOR";
            } else if (usuario instanceof Administrador) {
                rol = "ADMINISTRADOR";
            } else {
                rol = "CLIENTE";
            }
            String token = jwtUtil.generateToken(usuario.getEmail(), rol);
            return new LoginResponseDTO(token);
        } else {
            // 4. Si no coinciden, lanzar error
            throw new RuntimeException("Credenciales inválidas");
        }
    }

    @Override
    public Usuario actualizarPerfil(String email, PerfilRequestDTO dto) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Campos comunes
        if (dto.getNombre() != null) {
            usuario.setNombre(dto.getNombre());
        }
        if (dto.getAvatarUrl() != null) {
            usuario.setAvatarUrl(dto.getAvatarUrl());
        }

        // Campos específicos del Proveedor
        if (usuario instanceof Proveedor proveedor) {
            if (dto.getDescripcionTienda() != null) {
                proveedor.setDescripcionTienda(dto.getDescripcionTienda());
            }
            if (dto.getBannerUrl() != null) {
                proveedor.setBannerUrl(dto.getBannerUrl());
            }
            if (dto.getSitioWebUrl() != null) {
                proveedor.setSitioWebUrl(dto.getSitioWebUrl());
            }
            return usuarioRepository.save(proveedor);
        }

        return usuarioRepository.save(usuario);
    }
}