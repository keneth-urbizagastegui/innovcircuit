package com.utec.innovcircuit.innovcircuitbackend.service;

import com.utec.innovcircuit.innovcircuitbackend.dto.ProveedorDTO;

public interface IProveedorService {
    ProveedorDTO getProveedorPublicoById(Long proveedorId);
}