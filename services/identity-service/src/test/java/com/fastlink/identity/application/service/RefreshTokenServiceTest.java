package com.fastlink.identity.application.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fastlink.identity.application.exception.TokenReuseDetectedException;
import com.fastlink.identity.domain.model.RefreshToken;
import com.fastlink.identity.domain.model.Utilisateur;
import com.fastlink.identity.infrastructure.persistence.jpa.RefreshTokenJpaRepository;
import java.lang.reflect.Field;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class RefreshTokenServiceTest {

    private final RefreshTokenJpaRepository repository = org.mockito.Mockito.mock(RefreshTokenJpaRepository.class);
    private final RefreshTokenService service = new RefreshTokenService(repository);

    @Test
    void rotateDetectsRefreshTokenReuseAndRevokesTokenFamily() throws Exception {
        Utilisateur user = new Utilisateur("Security User", "security@example.com", "hash");
        setId(user, 42L);

        RefreshToken replacement = new RefreshToken(user, "replacement-hash", Instant.now().plusSeconds(3600));
        setId(replacement, 101L);

        RefreshToken reused = new RefreshToken(user, tokenHash("reused-token"), Instant.now().plusSeconds(3600));
        setId(reused, 100L);
        reused.revoke(Instant.now().minusSeconds(30), replacement);

        when(repository.findByTokenHash(tokenHash("reused-token"))).thenReturn(Optional.of(reused));

        assertThrows(TokenReuseDetectedException.class, () -> service.rotate("reused-token"));

        ArgumentCaptor<Instant> revokedAt = ArgumentCaptor.forClass(Instant.class);
        verify(repository).revokeTokenFamilyForUser(eq(42L), revokedAt.capture());
    }

    private static String tokenHash(String rawToken) throws Exception {
        java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
        byte[] hashed = digest.digest(rawToken.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(hashed);
    }

    private static void setId(Object target, Long id) throws Exception {
        Field field = target.getClass().getDeclaredField("id");
        field.setAccessible(true);
        field.set(target, id);
    }
}
