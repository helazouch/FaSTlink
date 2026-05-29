package com.fastlink.event.application.port.out;

import com.fastlink.event.domain.model.Evenement;
import java.util.Set;

public interface EventNotificationPort {

    void notifyEventPublished(Evenement evenement, String entityLabel, Set<Long> recipientUserIds);
}
