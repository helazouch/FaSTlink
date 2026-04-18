package com.fastlink.entity.application.port.out;

public interface IdentityValidationPort {

    void validateUserExists(Long utilisateurId);
}
