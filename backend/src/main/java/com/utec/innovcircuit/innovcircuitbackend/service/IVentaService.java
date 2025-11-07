package com.utec.innovcircuit.innovcircuitbackend.service;

import com.utec.innovcircuit.innovcircuitbackend.dto.CompraRequestDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.VentaResponseDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.EstadisticasProveedorDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.EstadisticasAdminDTO;
import com.utec.innovcircuit.innovcircuitbackend.dto.ReporteVentasDTO;
import java.util.List;

public interface IVentaService {
    VentaResponseDTO realizarCompra(CompraRequestDTO requestDTO, String emailCliente);

    // Historial del cliente: todas sus compras
    List<VentaResponseDTO> getComprasPorCliente(String emailCliente);

    // Estadísticas para proveedor
    EstadisticasProveedorDTO getEstadisticasProveedor(String emailProveedor);

    // Estadísticas para admin
    EstadisticasAdminDTO getEstadisticasAdmin();

    // Reporte detallado de ventas para admin
    ReporteVentasDTO getReporteVentas();
}