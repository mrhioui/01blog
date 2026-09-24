package com.example.demo.exception;

/**
 * Thrown when the client sends invalid input or an action that is not allowed by the request
 * itself (missing required fields, invalid file, nonsensical request, ...).
 * Mapped to HTTP 400 by {@link com.example.demo.config.GlobalExceptionHandler}; the message is
 * preserved and sent to the client.
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
