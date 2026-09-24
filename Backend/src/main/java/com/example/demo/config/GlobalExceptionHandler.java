package com.example.demo.config;

import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ConflictException;
import com.example.demo.exception.ForbiddenException;
import com.example.demo.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import jakarta.validation.ConstraintViolationException;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ---- Typed application exceptions: each carries its own descriptive message ----

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(ResourceNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage());
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<Map<String, String>> handleConflict(ConflictException ex) {
        return build(HttpStatus.CONFLICT, "Conflict", ex.getMessage());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(BadRequestException ex) {
        return build(HttpStatus.BAD_REQUEST, "Bad Request", ex.getMessage());
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<Map<String, String>> handleForbidden(ForbiddenException ex) {
        return build(HttpStatus.FORBIDDEN, "Forbidden", ex.getMessage());
    }

    // ---- Security / authentication ----

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDeniedException(AccessDeniedException ex) {
        String message = ex.getMessage();
        if (message == null || message.isBlank() || "Access is denied".equalsIgnoreCase(message)) {
            message = "You do not have permission to perform this action";
        }
        return build(HttpStatus.FORBIDDEN, "Forbidden", message);
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<Map<String, String>> handleDisabled(DisabledException ex) {
        return build(HttpStatus.FORBIDDEN, "Forbidden",
                "Your account has been banned. Please contact support if you think this is a mistake.");
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, String>> handleAuthentication(AuthenticationException ex) {
        return build(HttpStatus.UNAUTHORIZED, "Unauthorized", "Invalid username or password");
    }

    // ---- Bean validation ----

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> response = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> response.put(error.getField(), error.getDefaultMessage()));
        response.put("message", summarize(response));
        response.put("error", "Bad Request");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, String>> handleConstraintViolation(ConstraintViolationException ex) {
        Map<String, String> response = new HashMap<>();
        ex.getConstraintViolations()
                .forEach(v -> response.put(leafField(v.getPropertyPath().toString()), v.getMessage()));
        response.put("message", summarize(response));
        response.put("error", "Bad Request");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // ---- Framework / infrastructure ----

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        return build(HttpStatus.PAYLOAD_TOO_LARGE, "Payload Too Large",
                "The uploaded file is too large. Please choose a smaller file.");
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolationException(
            DataIntegrityViolationException ex) {
        log.warn("Data integrity violation", ex);
        return build(HttpStatus.CONFLICT, "Conflict", "Username or email already exists");
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        log.error("Unhandled exception", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", "An unexpected error occurred");
    }

    // ---- helpers ----

    private ResponseEntity<Map<String, String>> build(HttpStatus status, String error, String message) {
        Map<String, String> response = new HashMap<>();
        response.put("message", message != null ? message : error);
        response.put("error", error);
        return ResponseEntity.status(status).body(response);
    }

    private String summarize(Map<String, String> fieldErrors) {
        return fieldErrors.entrySet().stream()
                .filter(e -> !"error".equals(e.getKey()) && !"message".equals(e.getKey()))
                .map(e -> e.getKey() + ": " + e.getValue())
                .collect(Collectors.joining("; "));
    }

    private String leafField(String propertyPath) {
        if (propertyPath == null || propertyPath.isBlank()) {
            return "field";
        }
        int lastDot = propertyPath.lastIndexOf('.');
        return lastDot >= 0 && lastDot < propertyPath.length() - 1
                ? propertyPath.substring(lastDot + 1)
                : propertyPath;
    }
}
