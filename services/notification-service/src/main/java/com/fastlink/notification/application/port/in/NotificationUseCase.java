package com.fastlink.notification.application.port.in;

import com.fastlink.notification.application.dto.notification.CreateNotificationRequest;
import com.fastlink.notification.application.dto.notification.NotificationUtilisateurResponse;
import java.util.List;

public interface NotificationUseCase {

    List<NotificationUtilisateurResponse> createNotification(CreateNotificationRequest request);

    List<NotificationUtilisateurResponse> getNotificationsForUser(Long utilisateurId);

    NotificationUtilisateurResponse markAsRead(Long notificationId, Long utilisateurId);
}
