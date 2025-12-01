package com.utec.innovcircuit.innovcircuitbackend.service.strategy;

import com.utec.innovcircuit.innovcircuitbackend.model.Diseno;
import com.utec.innovcircuit.innovcircuitbackend.repository.DisenoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component("busquedaSimple")
public class BusquedaSimpleStrategy implements IBusquedaStrategy {

    @Autowired
    private DisenoRepository disenoRepository;

    @Override
    public List<Diseno> buscar(String query, Long categoriaId, Double minPrecio, Double maxPrecio) {
        if (query == null || query.trim().isEmpty()) {
            return disenoRepository.findByEstado("APROBADO");
        }
        return disenoRepository.findByEstadoAndNombreContainingIgnoreCase("APROBADO", query.trim());
    }
}
