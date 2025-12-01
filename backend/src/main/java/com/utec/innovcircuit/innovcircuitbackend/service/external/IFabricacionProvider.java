package com.utec.innovcircuit.innovcircuitbackend.service.external;

public interface IFabricacionProvider {
    Double cotizarFabricacion(Long disenoId);
    String enviarOrdenProduccion(Long pedidoId, String direccion);
}
