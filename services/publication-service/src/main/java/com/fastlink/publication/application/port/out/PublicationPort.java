package com.fastlink.publication.application.port.out;

import com.fastlink.publication.domain.model.Publication;
import java.util.Optional;

public interface PublicationPort {

    Publication save(Publication publication);

    Optional<Publication> findById(Long publicationId);
}
