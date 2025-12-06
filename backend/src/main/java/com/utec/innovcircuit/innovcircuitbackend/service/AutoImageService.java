package com.utec.innovcircuit.innovcircuitbackend.service;

import com.utec.innovcircuit.innovcircuitbackend.model.Diseno;

/**
 * Servicio para generar imágenes automáticas para diseños
 * usando APIs externas como Unsplash.
 */
public interface AutoImageService {
    /**
     * Busca una imagen acorde al diseño, la descarga, la guarda en uploads
     * y devuelve la ruta relativa (por ejemplo "/uploads/archivo.jpg").
     * Si no se encuentra nada o no hay API key, devuelve null.
     * 
     * @param diseno el diseño para el cual generar imagen
     * @return ruta relativa de la imagen guardada, o null si no se pudo generar
     */
    String generarImagenParaDiseno(Diseno diseno);
}
