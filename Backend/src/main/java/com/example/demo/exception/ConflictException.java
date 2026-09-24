package com.example.demo.exception;

/**
 * Thrown when a request conflicts with existing state (e.g. a username or email already in use).
 * Mapped to HTTP 409 by {@link com.example.demo.config.GlobalExceptionHandler}; the message is
 * preserved and sent to the client.
 */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
