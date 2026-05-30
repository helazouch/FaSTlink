package com.fastlink.community.infrastructure.persistence.adapter;

import com.fastlink.community.application.port.out.MessageCommunautePort;
import com.fastlink.community.domain.model.MessageCommunaute;
import com.fastlink.community.infrastructure.persistence.jpa.MessageCommunauteJpaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

@Component
public class MessageCommunautePersistenceAdapter implements MessageCommunautePort {

    private final MessageCommunauteJpaRepository messageCommunauteJpaRepository;

    public MessageCommunautePersistenceAdapter(MessageCommunauteJpaRepository messageCommunauteJpaRepository) {
        this.messageCommunauteJpaRepository = messageCommunauteJpaRepository;
    }

    @Override
    public MessageCommunaute save(MessageCommunaute messageCommunaute) {
        return messageCommunauteJpaRepository.save(messageCommunaute);
    }

    @Override
    public List<MessageCommunaute> findByCommunauteIdOrderByCreatedAtAsc(Long communauteId) {
        return messageCommunauteJpaRepository.findByCommunaute_IdOrderByCreatedAtAsc(communauteId);
    }

    @Override
    public List<MessageCommunaute> findByCommunauteIdOrderByCreatedAtAsc(Long communauteId, int limit) {
        return messageCommunauteJpaRepository.findByCommunaute_IdOrderByCreatedAtAsc(
                communauteId, PageRequest.of(0, limit));
    }

    @Override
    public Optional<MessageCommunaute> findLastByCommunauteId(Long communauteId) {
        return messageCommunauteJpaRepository.findTopByCommunaute_IdOrderByCreatedAtDesc(communauteId);
    }
}
