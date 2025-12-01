package com.utec.innovcircuit.innovcircuitbackend.service.external;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Primary
public class MockPCBWayAdapter implements IFabricacionProvider {
    @Override
    public Double cotizarFabricacion(Long disenoId) {
        try {
            Thread.sleep(500);
        } catch (InterruptedException ignored) {}
        double precio = 10.0 + (Math.random() * 20.0);
        System.out.println("[MockPCBWayAdapter] Cotización para diseño " + disenoId + ": S/" + String.format("%.2f", precio));
        return precio;
    }

    @Override
    public String enviarOrdenProduccion(Long pedidoId, String direccion) {
        String codigo = "PCBWAY-" + UUID.randomUUID().toString().substring(0, 8);
        System.out.println("[MockPCBWayAdapter] Enviando orden de producción. Pedido=" + pedidoId + ", dirección='" + direccion + "' -> código=" + codigo);
        return codigo;
    }
}
