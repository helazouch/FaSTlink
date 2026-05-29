package com.fastlink.event.application.port.out;

import java.util.Set;

public interface EventRecipientPort {

    Set<Long> findEntityMemberIds(Long entityId);

    Set<Long> findAllEntityMemberIds();
}
