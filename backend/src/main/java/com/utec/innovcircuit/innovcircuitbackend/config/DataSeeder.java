package com.utec.innovcircuit.innovcircuitbackend.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.utec.innovcircuit.innovcircuitbackend.dto.SeedDisenoDTO;
import com.utec.innovcircuit.innovcircuitbackend.model.Administrador;
import com.utec.innovcircuit.innovcircuitbackend.model.Categoria;
import com.utec.innovcircuit.innovcircuitbackend.model.Cliente;
import com.utec.innovcircuit.innovcircuitbackend.model.Diseno;
import com.utec.innovcircuit.innovcircuitbackend.model.DisenoImagen;
import com.utec.innovcircuit.innovcircuitbackend.model.Proveedor;
import com.utec.innovcircuit.innovcircuitbackend.model.Configuracion;
import com.utec.innovcircuit.innovcircuitbackend.repository.CategoriaRepository;
import com.utec.innovcircuit.innovcircuitbackend.repository.DisenoRepository;
import com.utec.innovcircuit.innovcircuitbackend.repository.UsuarioRepository;
import com.utec.innovcircuit.innovcircuitbackend.repository.ConfiguracionRepository;
import com.utec.innovcircuit.innovcircuitbackend.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
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
    @Autowired
    private ConfiguracionRepository configuracionRepository;
    @Autowired
    private FileStorageService fileStorageService;

    @Override
    public void run(String... args) throws Exception {
        // Inicializar almacenamiento y copiar archivos seed (imágenes y esquema placeholder)
        fileStorageService.init();
        copySeedFiles();

        // 1. Sembrar Usuarios primero (necesitamos al proveedor)
        if (usuarioRepository.count() == 0) {
            seedUsuarios();
        }
        // 2. Sembrar Diseños desde el JSON
        if (disenoRepository.count() == 0) {
            seedDisenosFromJSON();
        }

        // 3. Sembrar configuración de TASA_COMISION si no existe
        seedTasaComision();
    }

    // Copia imágenes PNG desde resources/seed-images y el esquema ZIP desde resources/seed-files
    private void copySeedFiles() {
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        try {
            // 1. Crear el directorio de destino
            Path seedDir = Paths.get("uploads/seed");
            if (!Files.exists(seedDir)) {
                Files.createDirectories(seedDir);
            }

            // 2. Copiar todas las imágenes
            Resource[] resources = resolver.getResources("classpath:seed-images/*.png");
            for (Resource resource : resources) {
                Path targetFile = seedDir.resolve(resource.getFilename());
                if (!Files.exists(targetFile)) {
                    try (InputStream is = resource.getInputStream()) {
                        Files.copy(is, targetFile, StandardCopyOption.REPLACE_EXISTING);
                    }
                }
            }
            System.out.println(resources.length + " imágenes de prueba copiadas a " + seedDir.toAbsolutePath());

            // 3. Copiar el esquemático placeholder
            Path targetSchematic = seedDir.resolve("schematic-placeholder.zip");
            if (!Files.exists(targetSchematic)) {
                try (InputStream is = getClass().getResourceAsStream("/seed-files/schematic-placeholder.zip")) {
                    if (is != null) {
                        Files.copy(is, targetSchematic, StandardCopyOption.REPLACE_EXISTING);
                        System.out.println("Esquemático placeholder copiado.");
                    }
                }
            }
        } catch (IOException e) {
            System.err.println("Error al copiar archivos de prueba (seed): " + e.getMessage());
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
                Diseno saved = disenoRepository.save(diseno);
                if (dto.getImagenUrl() != null && !dto.getImagenUrl().isBlank()) {
                    DisenoImagen di = new DisenoImagen();
                    di.setDiseno(saved);
                    di.setUrl(dto.getImagenUrl());
                    di.setOrden(0);
                    di.setThumbnail(true);
                    saved.getImagenes().add(di);
                    disenoRepository.save(saved);
                }
            }
        }
    }

    private void seedTasaComision() {
        configuracionRepository.findByClave("TASA_COMISION").orElseGet(() -> {
            Configuracion conf = new Configuracion();
            conf.setClave("TASA_COMISION");
            conf.setValor("0.20");
            return configuracionRepository.save(conf);
        });
    }
}
