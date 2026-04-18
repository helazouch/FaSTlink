package com.fastlink.notification.application.port.out;

import com.fastlink.notification.domain.model.Notification;

public interface NotificationPort {

    Notification save(Notification notification);
}
