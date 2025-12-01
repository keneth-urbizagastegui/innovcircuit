package com.utec.innovcircuit.innovcircuitbackend.service.strategy;

import com.utec.innovcircuit.innovcircuitbackend.model.Diseno;
import com.utec.innovcircuit.innovcircuitbackend.repository.DisenoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.util.List;

@Component("busquedaAvanzada")
public class BusquedaAvanzadaStrategy implements IBusquedaStrategy {

    @Autowired
    private DisenoRepository disenoRepository;

    @Override
    public List<Diseno> buscar(String query, Long categoriaId, Double minPrecio, Double maxPrecio) {
        Specification<Diseno> spec = (root, cq, cb) -> {
            var p = cb.equal(root.get("estado"), "APROBADO");
            if (query != null && !query.trim().isEmpty()) {
                String q = "%" + query.trim().toLowerCase() + "%";
                var byNombre = cb.like(cb.lower(root.get("nombre")), q);
                var byDesc = cb.like(cb.lower(root.get("descripcion")), q);
                p = cb.and(p, cb.or(byNombre, byDesc));
            }
            if (categoriaId != null) {
                p = cb.and(p, cb.equal(root.get("categoria").get("id"), categoriaId));
            }
            if (minPrecio != null) {
                p = cb.and(p, cb.greaterThanOrEqualTo(root.get("precio"), minPrecio));
            }
            if (maxPrecio != null) {
                p = cb.and(p, cb.lessThanOrEqualTo(root.get("precio"), maxPrecio));
            }
            return p;
        };
        return disenoRepository.findAll(spec);
    }
}
