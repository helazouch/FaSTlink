package com.fastlink.community.application.port.out;

import com.fastlink.community.domain.model.MessageCommunaute;
import java.util.List;

public interface MessageCommunautePort {

    MessageCommunaute save(MessageCommunaute messageCommunaute);

    List<MessageCommunaute> findByCommunauteIdOrderByCreatedAtAsc(Long communauteId);
}
