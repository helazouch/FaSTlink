package com.fastlink.notification.infrastructure.realtime.websocket.adapter;

import com.fastlink.notification.application.dto.notification.NotificationUtilisateurResponse;
import com.fastlink.notification.application.port.out.RealtimeNotificationPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class WebSocketRealtimeNotificationAdapter implements RealtimeNotificationPort {

    private static final Logger LOGGER = LoggerFactory.getLogger(WebSocketRealtimeNotificationAdapter.class);

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketRealtimeNotificationAdapter(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public void pushToUser(Long utilisateurId, NotificationUtilisateurResponse notification) {
        String destination = "/topic/users/" + utilisateurId + "/notifications";
        LOGGER.info("Sending realtime notification {} to {}", notification.notificationId(), destination);
        messagingTemplate.convertAndSend(destination, notification);
    }
}
