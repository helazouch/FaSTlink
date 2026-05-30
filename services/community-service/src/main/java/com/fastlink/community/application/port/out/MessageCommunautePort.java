package com.fastlink.community.application.port.out;

import com.fastlink.community.domain.model.MessageCommunaute;
import java.util.List;
import java.util.Optional;

public interface MessageCommunautePort {

    MessageCommunaute save(MessageCommunaute messageCommunaute);

    List<MessageCommunaute> findByCommunauteIdOrderByCreatedAtAsc(Long communauteId);

    List<MessageCommunaute> findByCommunauteIdOrderByCreatedAtAsc(Long communauteId, int limit);

    Optional<MessageCommunaute> findLastByCommunauteId(Long communauteId);
}
