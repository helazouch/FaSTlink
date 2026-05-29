package com.fastlink.publication.application.port.out;

import com.fastlink.publication.domain.model.Publication;
import java.util.Set;

public interface PublicationNotificationPort {

    void notifyPublicationCreated(Publication publication, Set<Long> recipientUserIds);
}
