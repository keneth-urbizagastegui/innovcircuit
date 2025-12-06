package com.utec.innovcircuit.innovcircuitbackend.service;

import com.utec.innovcircuit.innovcircuitbackend.model.Diseno;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

/**
 * Implementación de AutoImageService que usa la API de Unsplash
 * para buscar y descargar imágenes relacionadas con diseños electrónicos.
 */
@Service
public class AutoImageServiceImpl implements AutoImageService {

    @Value("${images.provider.unsplash.key:}")
    private String unsplashKey;

    private final FileStorageService fileStorageService;
    private final RestTemplate restTemplate;

    @Autowired
    public AutoImageServiceImpl(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
        this.restTemplate = new RestTemplate();
    }

    @Override
    public String generarImagenParaDiseno(Diseno diseno) {
        if (unsplashKey == null || unsplashKey.isBlank()) {
            return null; // Funcionalidad no configurada
        }

        String query = buildQuery(diseno);
        if (query.isBlank()) {
            return null;
        }

        try {
            // 1) Buscar en Unsplash
            String imageUrl = searchUnsplash(query);
            if (imageUrl == null) {
                return null;
            }

            // 2) Descargar imagen
            byte[] imageBytes = downloadImage(imageUrl);
            if (imageBytes == null || imageBytes.length == 0) {
                return null;
            }

            // 3) Guardar en /uploads
            String extension = "jpg";
            String suggestedName = "auto_" + diseno.getId() + "_" + System.currentTimeMillis() + "." + extension;
            return fileStorageService.storeBytes(imageBytes, suggestedName, "image/jpeg");

        } catch (Exception ex) {
            System.err.println("[AutoImageService] Error al generar imagen: " + ex.getMessage());
            return null;
        }
    }

    /**
     * Busca una imagen en Unsplash y devuelve la URL de la imagen encontrada.
     */
    private String searchUnsplash(String query) {
        try {
            UriComponentsBuilder builder = UriComponentsBuilder
                    .fromHttpUrl("https://api.unsplash.com/search/photos")
                    .queryParam("query", query)
                    .queryParam("per_page", 1)
                    .queryParam("orientation", "landscape");

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Client-ID " + unsplashKey);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    builder.toUriString(),
                    HttpMethod.GET,
                    entity,
                    Map.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return null;
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> results = (List<Map<String, Object>>) response.getBody().get("results");
            if (results == null || results.isEmpty()) {
                return null;
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> first = results.get(0);
            @SuppressWarnings("unchecked")
            Map<String, String> urls = (Map<String, String>) first.get("urls");

            return urls != null ? urls.get("regular") : null;

        } catch (Exception ex) {
            System.err.println("[AutoImageService] Error buscando en Unsplash: " + ex.getMessage());
            return null;
        }
    }

    /**
     * Descarga una imagen desde una URL y devuelve los bytes.
     */
    private byte[] downloadImage(String imageUrl) {
        try {
            return restTemplate.getForObject(imageUrl, byte[].class);
        } catch (Exception ex) {
            System.err.println("[AutoImageService] Error descargando imagen: " + ex.getMessage());
            return null;
        }
    }

    /**
     * Construye una query de búsqueda basada en el nombre y categoría del diseño.
     */
    private String buildQuery(Diseno diseno) {
        StringBuilder sb = new StringBuilder();

        if (diseno.getNombre() != null && !diseno.getNombre().isBlank()) {
            sb.append(diseno.getNombre()).append(" ");
        }

        if (diseno.getCategoria() != null && diseno.getCategoria().getNombre() != null) {
            sb.append(diseno.getCategoria().getNombre()).append(" ");
        }

        // Añadir keywords genéricas para mejorar resultados
        sb.append("electronic pcb circuit board hardware");

        return sb.toString().trim();
    }
}
