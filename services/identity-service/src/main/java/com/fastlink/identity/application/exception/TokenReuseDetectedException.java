package com.fastlink.identity.application.exception;

public class TokenReuseDetectedException extends RuntimeException {

    public TokenReuseDetectedException(String message) {
        super(message);
    }
}
