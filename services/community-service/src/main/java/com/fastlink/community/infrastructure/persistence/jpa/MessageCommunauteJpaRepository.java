package com.fastlink.community.infrastructure.persistence.jpa;

import com.fastlink.community.domain.model.MessageCommunaute;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageCommunauteJpaRepository extends JpaRepository<MessageCommunaute, Long> {

    List<MessageCommunaute> findByCommunaute_IdOrderByCreatedAtAsc(Long communauteId);

    List<MessageCommunaute> findByCommunaute_IdOrderByCreatedAtAsc(Long communauteId, Pageable pageable);

    Optional<MessageCommunaute> findTopByCommunaute_IdOrderByCreatedAtDesc(Long communauteId);
}
