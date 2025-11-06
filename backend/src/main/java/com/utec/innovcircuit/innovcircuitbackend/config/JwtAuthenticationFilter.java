package com.utec.innovcircuit.innovcircuitbackend.config;

import com.utec.innovcircuit.innovcircuitbackend.repository.UsuarioRepository;
import com.utec.innovcircuit.innovcircuitbackend.service.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return; // Sin token, dejar que la cadena continúe; endpoints protegidos devolverán 401
        }

        jwt = authHeader.substring(7); // Quitar "Bearer "
        try {
            userEmail = jwtUtil.extractEmail(jwt);
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // 1. Extraer el ROL del token
                String rol = jwtUtil.extractRol(jwt);
                // 2. Crear authorities con el prefijo requerido por Spring Security
                List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + rol));

                UserDetails userDetails = usuarioRepository.findByEmail(userEmail)
                        .map(usuario -> new org.springframework.security.core.userdetails.User(
                                usuario.getEmail(),
                                usuario.getPassword(),
                                authorities)) // Pasamos las authorities
                        .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

                if (!jwtUtil.isTokenExpired(jwt)) {
                    // 4. Crear el token de autenticación CON roles
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            logger.warn("Error al procesar el token JWT: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}