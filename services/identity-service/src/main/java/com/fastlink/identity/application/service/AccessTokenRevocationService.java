package com.fastlink.identity.application.service;

import com.fastlink.identity.domain.model.AccessTokenRevocation;
import com.fastlink.identity.infrastructure.persistence.jpa.AccessTokenRevocationJpaRepository;
import java.time.Instant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AccessTokenRevocationService {

    private final AccessTokenRevocationJpaRepository accessTokenRevocationJpaRepository;

    public AccessTokenRevocationService(AccessTokenRevocationJpaRepository accessTokenRevocationJpaRepository) {
        this.accessTokenRevocationJpaRepository = accessTokenRevocationJpaRepository;
    }

    public void revoke(String tokenId, Instant expiresAt) {
        if (tokenId == null || tokenId.isBlank() || expiresAt == null || expiresAt.isBefore(Instant.now())) {
            return;
        }
        accessTokenRevocationJpaRepository.deleteExpired(Instant.now());
        accessTokenRevocationJpaRepository.save(new AccessTokenRevocation(tokenId, expiresAt));
    }

    @Transactional(readOnly = true)
    public boolean isRevoked(String tokenId) {
        if (tokenId == null || tokenId.isBlank()) {
            return false;
        }
        return accessTokenRevocationJpaRepository.existsByTokenIdAndExpiresAtAfter(tokenId, Instant.now());
    }
}
