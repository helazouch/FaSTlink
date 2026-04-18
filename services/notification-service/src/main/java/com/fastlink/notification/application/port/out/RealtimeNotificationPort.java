package com.fastlink.notification.application.port.out;

import com.fastlink.notification.application.dto.notification.NotificationUtilisateurResponse;

public interface RealtimeNotificationPort {

    void pushToUser(Long utilisateurId, NotificationUtilisateurResponse notification);
}
