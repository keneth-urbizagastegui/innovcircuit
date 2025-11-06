package com.utec.innovcircuit.innovcircuitbackend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.lang.IllegalStateException;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@ControllerAdvice
public class GlobalExceptionHandler {
    // Manejador para errores de Validación (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    // Manejador para errores "No Encontrado" (ej. findById.orElseThrow)
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<String> handleNotFoundException(NoSuchElementException ex) {
        return new ResponseEntity<>("Error: Recurso no encontrado. " + ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    // *** INICIO DE NUEVO HANDLER ***
    // Manejador para violaciones de Reglas de Negocio (ej. comprar item no aprobado)
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleBusinessRuleException(IllegalStateException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }
    // *** FIN DE NUEVO HANDLER ***

    // Manejador general para otros errores (ej. email duplicado)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        // Específicamente para el error de email duplicado que definimos
        if (ex.getMessage() != null && ex.getMessage().contains("El email ya está en uso")) {
            return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
        }
        // Otros errores
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}