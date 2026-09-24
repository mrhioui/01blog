package com.example.demo.exception;

/**
 * Thrown when a requested resource (user, post, report, notification, ...) does not exist.
 * Mapped to HTTP 404 by {@link com.example.demo.config.GlobalExceptionHandler}; the message is
 * preserved and sent to the client.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
