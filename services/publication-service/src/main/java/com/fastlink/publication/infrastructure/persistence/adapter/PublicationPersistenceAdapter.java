package com.fastlink.publication.infrastructure.persistence.adapter;

import com.fastlink.publication.application.port.out.PublicationPort;
import com.fastlink.publication.domain.model.Publication;
import com.fastlink.publication.infrastructure.persistence.jpa.PublicationJpaRepository;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class PublicationPersistenceAdapter implements PublicationPort {

    private final PublicationJpaRepository publicationJpaRepository;

    public PublicationPersistenceAdapter(PublicationJpaRepository publicationJpaRepository) {
        this.publicationJpaRepository = publicationJpaRepository;
    }

    @Override
    public Publication save(Publication publication) {
        return publicationJpaRepository.save(publication);
    }

    @Override
    public Optional<Publication> findById(Long publicationId) {
        return publicationJpaRepository.findById(publicationId);
    }
}
