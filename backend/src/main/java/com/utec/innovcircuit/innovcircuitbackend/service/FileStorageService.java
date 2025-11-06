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
}