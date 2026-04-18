package com.fastlink.publication.application.port.out;

import com.fastlink.publication.domain.model.Publication;

public interface PublicationEventPort {

    void publishPublicationCreated(Publication publication);
}
