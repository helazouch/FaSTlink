package com.fastlink.publication.application.port.out;

import java.util.Set;

public interface PublicationRecipientPort {

    Set<Long> findEntityMemberIds(Long entityId);

    Set<Long> findAllEntityMemberIds();
}
