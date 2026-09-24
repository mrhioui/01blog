package com.example.demo.exception;

/**
 * Thrown when the caller is authenticated but not allowed to perform the requested action
 * (e.g. banning yourself, banning an admin, deleting your own account).
 * Mapped to HTTP 403 by {@link com.example.demo.config.GlobalExceptionHandler}; the message is
 * preserved and sent to the client.
 */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
