package com.fastlink.identity.infrastructure.persistence.jpa;

import com.fastlink.identity.domain.model.AccessTokenRevocation;
import java.time.Instant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AccessTokenRevocationJpaRepository extends JpaRepository<AccessTokenRevocation, String> {

    boolean existsByTokenIdAndExpiresAtAfter(String tokenId, Instant now);

    @Modifying
    @Query("delete from AccessTokenRevocation atr where atr.expiresAt <= :now")
    int deleteExpired(@Param("now") Instant now);
}
