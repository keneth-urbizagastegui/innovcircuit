package com.utec.innovcircuit.innovcircuitbackend.repository;

import com.utec.innovcircuit.innovcircuitbackend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Método para buscar un usuario por su email
    Optional<Usuario> findByEmail(String email);

    // Método genérico para obtener un subtipo específico por email (por ejemplo, Proveedor)
    default <T extends Usuario> Optional<T> findByEmail(String email, Class<T> type) {
        return findByEmail(email)
                .filter(type::isInstance)
                .map(type::cast);
    }
}