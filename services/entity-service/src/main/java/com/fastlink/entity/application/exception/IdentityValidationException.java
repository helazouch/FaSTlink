package com.fastlink.entity.application.exception;

public class IdentityValidationException extends RuntimeException {

    public IdentityValidationException(String message) {
        super(message);
    }

    public IdentityValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
