package com.fastlink.publication.infrastructure.persistence.adapter;

import com.fastlink.publication.application.port.out.PublicationPort;
import com.fastlink.publication.domain.model.Publication;
import com.fastlink.publication.infrastructure.persistence.jpa.PublicationJpaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @Override
    public List<Publication> findAll() {
        return publicationJpaRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public Page<Publication> search(Long entityId, Long authorId, String search, Pageable pageable) {
        String normalizedSearch = search == null || search.isBlank() ? null : search.trim();
        if (normalizedSearch == null) {
            return publicationJpaRepository.searchPublicationsWithoutText(entityId, authorId, pageable);
        }
        return publicationJpaRepository.searchPublications(entityId, authorId, normalizedSearch, pageable);
    }

    @Override
    public Page<Publication> findAll(Pageable pageable) {
        return publicationJpaRepository.findAll(pageable);
    }
}
