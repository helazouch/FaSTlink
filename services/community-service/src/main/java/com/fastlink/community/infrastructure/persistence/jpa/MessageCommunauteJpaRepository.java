package com.fastlink.community.infrastructure.persistence.jpa;

import com.fastlink.community.domain.model.MessageCommunaute;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageCommunauteJpaRepository extends JpaRepository<MessageCommunaute, Long> {

    List<MessageCommunaute> findByCommunaute_IdOrderByCreatedAtAsc(Long communauteId);
}
