package com.utec.innovcircuit.innovcircuitbackend.dto;

public class UsuarioAdminUpdateDTO {
    private String nombre;
    private String email;
    private String estado; // ACTIVO / BLOQUEADO

    // Getters y Setters
    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
