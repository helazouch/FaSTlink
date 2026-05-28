package com.fastlink.identity.application.service;

import com.fastlink.identity.application.exception.ResourceNotFoundException;
import com.fastlink.identity.application.exception.TokenReuseDetectedException;
import com.fastlink.identity.domain.model.RefreshToken;
import com.fastlink.identity.domain.model.Utilisateur;
import com.fastlink.identity.infrastructure.persistence.jpa.RefreshTokenJpaRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RefreshTokenService {

    private static final Logger LOGGER = LoggerFactory.getLogger(RefreshTokenService.class);
    private static final long REFRESH_TOKEN_TTL_DAYS = 30;

    private final RefreshTokenJpaRepository refreshTokenJpaRepository;

    public RefreshTokenService(RefreshTokenJpaRepository refreshTokenJpaRepository) {
        this.refreshTokenJpaRepository = refreshTokenJpaRepository;
    }

    public TokenPair create(Utilisateur utilisateur) {
        String rawToken = generateRawToken();
        String tokenHash = hashToken(rawToken);
        Instant expiresAt = Instant.now().plus(REFRESH_TOKEN_TTL_DAYS, ChronoUnit.DAYS);

        RefreshToken refreshToken = new RefreshToken(utilisateur, tokenHash, expiresAt);
        refreshTokenJpaRepository.save(refreshToken);

        return new TokenPair(rawToken, refreshToken);
    }

    public TokenPair rotate(String rawToken) {
        RefreshToken existing = refreshTokenJpaRepository.findByTokenHash(hashToken(rawToken))
                .orElseThrow(() -> new ResourceNotFoundException("Refresh token introuvable"));

        if (!existing.isActive()) {
            detectReuseAndRevokeFamily(existing);
            throw new ResourceNotFoundException("Refresh token invalide ou expire");
        }

        TokenPair replacement = create(existing.getUtilisateur());
        existing.revoke(Instant.now(), replacement.refreshToken());
        refreshTokenJpaRepository.save(existing);

        return replacement;
    }

    public void revoke(String rawToken) {
        RefreshToken existing = refreshTokenJpaRepository.findByTokenHash(hashToken(rawToken))
                .orElseThrow(() -> new ResourceNotFoundException("Refresh token introuvable"));
        if (existing.isActive()) {
            existing.revoke(Instant.now(), null);
            refreshTokenJpaRepository.save(existing);
        }
    }

    public void revokeAllForUser(Long userId) {
        refreshTokenJpaRepository.revokeAllForUser(userId, Instant.now());
    }

    private void detectReuseAndRevokeFamily(RefreshToken existing) {
        if (existing.getRevokedAt() != null && existing.getReplacedBy() != null) {
            Long userId = existing.getUtilisateur().getId();
            refreshTokenJpaRepository.revokeTokenFamilyForUser(userId, Instant.now());
            LOGGER.warn(
                    "security.refresh_token_reuse_detected userId={} tokenId={} replacedByTokenId={}",
                    userId,
                    existing.getId(),
                    existing.getReplacedBy().getId());
            throw new TokenReuseDetectedException("Refresh token reuse detected");
        }

        if (Instant.now().isAfter(existing.getExpiresAt())) {
            LOGGER.info(
                    "security.refresh_token_expired userId={} tokenId={}",
                    existing.getUtilisateur().getId(),
                    existing.getId());
        }
    }

    private String generateRawToken() {
        return UUID.randomUUID() + "." + UUID.randomUUID();
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hashed);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 not available", ex);
        }
    }

    public record TokenPair(String rawToken, RefreshToken refreshToken) {
    }
}
