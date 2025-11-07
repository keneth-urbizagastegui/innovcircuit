package com.utec.innovcircuit.innovcircuitbackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {
    private final Path fileStorageLocation;

    public FileStorageService(@Value("${file.upload-dir}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("No se pudo crear el directorio para guardar archivos.", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        // Generar un nombre de archivo único
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        try {
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Devolvemos la RUTA (o URL) de acceso al archivo
            // Por ahora, una ruta simple. En producción sería una URL.
            return "/uploads/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("No se pudo guardar el archivo " + fileName, ex);
        }
    }

    /**
     * Elimina el archivo asociado a la URL o al nombre de archivo.
     * Acepta entradas como "/uploads/UUID_nombre.zip" y extrae "UUID_nombre.zip".
     * Si el archivo existe en el directorio de almacenamiento, lo elimina.
     */
    public void deleteFile(String urlOrFilename) {
        if (urlOrFilename == null || urlOrFilename.isBlank()) return;
        String fileName = extractFileName(urlOrFilename);
        if (fileName == null || fileName.isBlank()) return;
        try {
            Path targetLocation = this.fileStorageLocation.resolve(fileName).normalize();
            Files.deleteIfExists(targetLocation);
        } catch (IOException ex) {
            // No propagamos para no bloquear la eliminación del diseño; registramos si fuese necesario
            System.err.println("[FileStorageService] No se pudo eliminar el archivo: " + fileName + " -> " + ex.getMessage());
        }
    }

    // Extrae el nombre del archivo de una URL del estilo "/uploads/<nombre>" o devuelve el valor si ya es un nombre
    private String extractFileName(String urlOrFilename) {
        String trimmed = urlOrFilename.trim();
        // Si contiene "/uploads/", tomamos todo lo que sigue a ese prefijo
        String prefix = "/uploads/";
        int idx = trimmed.indexOf(prefix);
        if (idx >= 0) {
            return trimmed.substring(idx + prefix.length());
        }
        // Si viene como ruta absoluta o relativa, intentamos tomar el último segmento
        int lastSlash = Math.max(trimmed.lastIndexOf('/'), trimmed.lastIndexOf('\\'));
        if (lastSlash >= 0 && lastSlash < trimmed.length() - 1) {
            return trimmed.substring(lastSlash + 1);
        }
        return trimmed; // caso simple: ya es nombre de archivo
    }
}