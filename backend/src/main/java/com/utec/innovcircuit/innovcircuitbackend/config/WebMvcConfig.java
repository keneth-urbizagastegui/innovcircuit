package com.utec.innovcircuit.innovcircuitbackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Expone el directorio local ./uploads/ bajo la ruta /uploads/**
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:./uploads/");
    }
}