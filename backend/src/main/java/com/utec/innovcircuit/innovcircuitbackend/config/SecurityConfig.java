package com.utec.innovcircuit.innovcircuitbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod; // Permitir reglas específicas por método HTTP

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Habilitar @PreAuthorize
public class SecurityConfig {
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    @Bean
    public PasswordEncoder passwordEncoder() {
        // Bean para poder inyectar el codificador de contraseñas
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // API stateless, CSRF no aplica
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // No sesiones
            .authorizeHttpRequests(auth -> auth
                // Rutas públicas
                .requestMatchers("/api/v1/auth/**").permitAll() // Permitir registro y login
                .requestMatchers("/uploads/**").permitAll() // Archivos estáticos subidos

                // Catálogo público (Diseños y Categorías): permitir GET sin autenticación
                .requestMatchers(HttpMethod.GET, "/api/v1/disenos").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/disenos/**").permitAll()
                // Las rutas de reseñas bajo /api/v1/disenos/** ya están cubiertas por la regla anterior,
                // evitamos patrones redundantes que pueden causar errores de coincidencia en Spring Security 6
                .requestMatchers(HttpMethod.GET, "/api/v1/categorias").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/categorias/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/proveedores/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/preguntas/diseno/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/disenos/destacados").permitAll()

                // Panel de Administración: proteger todo bajo /api/v1/admin/**
                .requestMatchers("/api/v1/admin/**").hasRole("ADMINISTRADOR")

                // Cualquier otra solicitud requiere autenticación
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}