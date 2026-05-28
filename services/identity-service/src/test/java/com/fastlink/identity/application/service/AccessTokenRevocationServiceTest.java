package com.fastlink.identity.application.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fastlink.identity.domain.model.AccessTokenRevocation;
import com.fastlink.identity.infrastructure.persistence.jpa.AccessTokenRevocationJpaRepository;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class AccessTokenRevocationServiceTest {

    private final AccessTokenRevocationJpaRepository repository =
            org.mockito.Mockito.mock(AccessTokenRevocationJpaRepository.class);
    private final AccessTokenRevocationService service = new AccessTokenRevocationService(repository);

    @Test
    void revokeStoresNonExpiredTokenId() {
        service.revoke("jti-1", Instant.now().plusSeconds(300));

        ArgumentCaptor<AccessTokenRevocation> captor = ArgumentCaptor.forClass(AccessTokenRevocation.class);
        verify(repository).deleteExpired(any(Instant.class));
        verify(repository).save(captor.capture());
        assertTrue("jti-1".equals(captor.getValue().getTokenId()));
    }

    @Test
    void revokeSkipsExpiredTokens() {
        service.revoke("jti-expired", Instant.now().minusSeconds(1));

        verify(repository, never()).save(any());
    }

    @Test
    void isRevokedDelegatesToRepositoryWithExpirationGuard() {
        when(repository.existsByTokenIdAndExpiresAtAfter(org.mockito.ArgumentMatchers.eq("jti-2"), any(Instant.class)))
                .thenReturn(true);

        assertTrue(service.isRevoked("jti-2"));
        assertFalse(service.isRevoked(""));
    }
}
