package com.utec.innovcircuit.innovcircuitbackend.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.utec.innovcircuit.innovcircuitbackend.dto.SeedDisenoDTO;
import com.utec.innovcircuit.innovcircuitbackend.model.Administrador;
import com.utec.innovcircuit.innovcircuitbackend.model.Categoria;
import com.utec.innovcircuit.innovcircuitbackend.model.Cliente;
import com.utec.innovcircuit.innovcircuitbackend.model.Diseno;
import com.utec.innovcircuit.innovcircuitbackend.model.Proveedor;
import com.utec.innovcircuit.innovcircuitbackend.repository.CategoriaRepository;
import com.utec.innovcircuit.innovcircuitbackend.repository.DisenoRepository;
import com.utec.innovcircuit.innovcircuitbackend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private CategoriaRepository categoriaRepository;
    @Autowired
    private DisenoRepository disenoRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private ResourceLoader resourceLoader; // Para leer archivos del classpath

    @Override
    public void run(String... args) throws Exception {
        // 1. Sembrar Usuarios primero (necesitamos al proveedor)
        if (usuarioRepository.count() == 0) {
            seedUsuarios();
        }
        // 2. Sembrar Diseños desde el JSON
        if (disenoRepository.count() == 0) {
            seedDisenosFromJSON();
        }
    }

    private void seedUsuarios() {
        String passCifrado = passwordEncoder.encode("password123");
        String baseAvatar = "https://i.pravatar.cc/150?u=" + System.currentTimeMillis();

        Administrador admin = new Administrador();
        admin.setNombre("Admin UTEC");
        admin.setEmail("admin@innovcircuit.com");
        admin.setPassword(passCifrado);
        admin.setAvatarUrl(baseAvatar + "-admin");
        admin.setEstado("ACTIVO");
        usuarioRepository.save(admin);

        Proveedor prov = new Proveedor();
        prov.setNombre("Proveedor UTEC");
        prov.setEmail("proveedor@innovcircuit.com");
        prov.setPassword(passCifrado);
        prov.setAvatarUrl(baseAvatar + "-prov");
        prov.setEstado("ACTIVO");
        usuarioRepository.save(prov);

        Cliente cliente = new Cliente();
        cliente.setNombre("Cliente UTEC");
        cliente.setEmail("cliente@innovcircuit.com");
        cliente.setPassword(passCifrado);
        cliente.setAvatarUrl(baseAvatar + "-cli");
        cliente.setEstado("ACTIVO");
        usuarioRepository.save(cliente);
    }

    private void seedDisenosFromJSON() throws Exception {
        // Cargar el proveedor
        Proveedor proveedor = usuarioRepository.findByEmail("proveedor@innovcircuit.com", Proveedor.class)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado para sembrar"));

        // Cargar el archivo JSON desde resources
        Resource resource = resourceLoader.getResource("classpath:seed-data.json");
        try (InputStream inputStream = resource.getInputStream()) {
            ObjectMapper mapper = new ObjectMapper();
            // Leer el JSON en una Lista de nuestros DTOs
            List<SeedDisenoDTO> disenosDTO = mapper.readValue(inputStream, new TypeReference<List<SeedDisenoDTO>>() {});

            // Procesar cada diseño del JSON
            for (SeedDisenoDTO dto : disenosDTO) {
                // Buscar o crear la categoría
                Categoria categoria = categoriaRepository.findByNombre(dto.getCategoria())
                        .orElseGet(() -> {
                            Categoria newCat = new Categoria();
                            newCat.setNombre(dto.getCategoria());
                            newCat.setDescripcion("Categoría sembrada desde JSON");
                            return categoriaRepository.save(newCat);
                        });

                // Crear la entidad Diseno
                Diseno diseno = new Diseno();
                diseno.setNombre(dto.getNombre());
                diseno.setDescripcion(dto.getDescripcion());
                diseno.setPrecio(dto.getPrecio());
                diseno.setGratuito(dto.getPrecio() != null && dto.getPrecio() == 0.0);
                diseno.setImagenUrl(dto.getImagenUrl());
                diseno.setEstado("APROBADO"); // Aprobarlos de inmediato
                diseno.setLikesCount((int) (Math.random() * 500));
                diseno.setDescargasCount((int) (Math.random() * 2000));
                diseno.setCategoria(categoria);
                diseno.setProveedor(proveedor);
                disenoRepository.save(diseno);
            }
        }
    }
}