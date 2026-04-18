package com.fastlink.community.infrastructure.realtime;

import com.fastlink.community.application.dto.message.MessageCommunauteResponse;
import com.fastlink.community.application.port.out.CommunityRealtimePort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class WebSocketCommunityRealtimeAdapter implements CommunityRealtimePort {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketCommunityRealtimeAdapter(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public void publishMessage(Long communauteId, MessageCommunauteResponse message) {
        messagingTemplate.convertAndSend("/topic/communities/" + communauteId, message);
    }
}
