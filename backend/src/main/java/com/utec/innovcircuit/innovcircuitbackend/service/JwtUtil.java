package com.utec.innovcircuit.innovcircuitbackend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Service
public class JwtUtil {
    @Value("${jwt.secret}")
    private String secret;

    private Key key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // Genera un token para un usuario
    public String generateToken(String email, String rol) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(email)
                .claim("rol", rol) // Añadimos el ROL al token
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + 1000 * 60 * 60 * 10)) // 10 horas
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Validación y extracción de claims
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    public Date extractExpiration(String token) {
        return extractAllClaims(token).getExpiration();
    }

    public Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // Extrae el rol desde el claim "rol" guardado en el token
    public String extractRol(String token) {
        return extractAllClaims(token).get("rol", String.class);
    }
}