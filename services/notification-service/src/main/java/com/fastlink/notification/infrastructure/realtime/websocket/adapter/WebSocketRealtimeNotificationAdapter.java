package com.fastlink.notification.infrastructure.realtime.websocket.adapter;

import com.fastlink.notification.application.dto.notification.NotificationUtilisateurResponse;
import com.fastlink.notification.application.port.out.RealtimeNotificationPort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class WebSocketRealtimeNotificationAdapter implements RealtimeNotificationPort {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketRealtimeNotificationAdapter(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public void pushToUser(Long utilisateurId, NotificationUtilisateurResponse notification) {
        messagingTemplate.convertAndSend("/topic/users/" + utilisateurId + "/notifications", notification);
    }
}
