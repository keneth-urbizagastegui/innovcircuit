package com.utec.innovcircuit.innovcircuitbackend.service.strategy;

import com.utec.innovcircuit.innovcircuitbackend.model.Diseno;
import java.util.List;

public interface IBusquedaStrategy {
    List<Diseno> buscar(String query, Long categoriaId, Double minPrecio, Double maxPrecio);
}
