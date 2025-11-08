package com.utec.innovcircuit.innovcircuitbackend.service;

import com.utec.innovcircuit.innovcircuitbackend.dto.ProveedorDTO;
import com.utec.innovcircuit.innovcircuitbackend.model.Proveedor;
import com.utec.innovcircuit.innovcircuitbackend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
public class ProveedorServiceImpl implements IProveedorService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public ProveedorDTO getProveedorPublicoById(Long proveedorId) {
        Proveedor proveedor = usuarioRepository.findById(proveedorId)
                .filter(Proveedor.class::isInstance)
                .map(Proveedor.class::cast)
                .orElseThrow(() -> new NoSuchElementException("Proveedor no encontrado"));
        return convertToDTO(proveedor);
    }

    private ProveedorDTO convertToDTO(Proveedor p) {
        ProveedorDTO dto = new ProveedorDTO();
        dto.setId(p.getId());
        dto.setNombre(p.getNombre());
        dto.setAvatarUrl(p.getAvatarUrl());
        dto.setDescripcionTienda(p.getDescripcionTienda());
        dto.setBannerUrl(p.getBannerUrl());
        dto.setSitioWebUrl(p.getSitioWebUrl());
        return dto;
    }
}