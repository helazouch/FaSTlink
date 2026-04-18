package com.fastlink.community.application.port.in;

import com.fastlink.community.application.dto.message.MessageCommunauteResponse;
import com.fastlink.community.application.dto.message.SendMessageRequest;
import java.util.List;

public interface MessageCommunauteUseCase {

    MessageCommunauteResponse sendMessage(Long communauteId, SendMessageRequest request);

    List<MessageCommunauteResponse> getMessages(Long communauteId, Long utilisateurId);
}
