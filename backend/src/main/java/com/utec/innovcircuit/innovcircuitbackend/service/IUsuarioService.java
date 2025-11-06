package com.utec.innovcircuit.innovcircuitbackend.service;

import com.utec.innovcircuit.innovcircuitbackend.dto.UsuarioRegistroDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.UsuarioLoginDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.LoginResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.model.Usuario;

public interface IUsuarioService {
    Usuario registrarUsuario(UsuarioRegistroDTO registroDTO);
    LoginResponseDTO login(UsuarioLoginDTO loginDTO);
}