package com.example.demo.config;

import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

/**
 * Writes the same {@code {"message": ..., "error": ...}} JSON envelope that
 * {@link GlobalExceptionHandler} produces, for the security layer (filters and entry points)
 * which run outside the {@code @ControllerAdvice} and therefore cannot rely on it.
 */
public final class JsonErrorWriter {

    private JsonErrorWriter() {
    }

    public static void write(HttpServletResponse response, int status, String message, String error)
            throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(
                "{\"message\":\"" + escape(message) + "\",\"error\":\"" + escape(error) + "\"}");
    }

    private static String escape(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
