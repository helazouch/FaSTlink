package com.fastlink.identity.infrastructure.persistence.jpa;

import com.fastlink.identity.domain.model.RefreshToken;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RefreshTokenJpaRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("update RefreshToken rt set rt.revokedAt = :revokedAt where rt.utilisateur.id = :userId and rt.revokedAt is null")
    int revokeAllForUser(@Param("userId") Long userId, @Param("revokedAt") Instant revokedAt);

    @Modifying
    @Query("""
            update RefreshToken rt
               set rt.revokedAt = :revokedAt
             where rt.utilisateur.id = :userId
               and (rt.revokedAt is null or rt.replacedBy is not null)
            """)
    int revokeTokenFamilyForUser(@Param("userId") Long userId, @Param("revokedAt") Instant revokedAt);
}
