package com.fastlink.identity.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "access_token_revocations")
public class AccessTokenRevocation {

    @Id
    @Column(name = "token_id", nullable = false, length = 80)
    private String tokenId;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "revoked_at", nullable = false)
    private Instant revokedAt;

    protected AccessTokenRevocation() {
    }

    public AccessTokenRevocation(String tokenId, Instant expiresAt) {
        this.tokenId = tokenId;
        this.expiresAt = expiresAt;
    }

    @PrePersist
    void onCreate() {
        if (revokedAt == null) {
            revokedAt = Instant.now();
        }
    }

    public String getTokenId() {
        return tokenId;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }
}
