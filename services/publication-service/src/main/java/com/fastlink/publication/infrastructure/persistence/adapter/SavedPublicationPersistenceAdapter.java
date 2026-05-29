package com.fastlink.publication.infrastructure.persistence.adapter;

import com.fastlink.publication.application.port.out.SavedPublicationPort;
import com.fastlink.publication.domain.model.SavedPublication;
import com.fastlink.publication.infrastructure.persistence.jpa.SavedPublicationJpaRepository;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

@Component
public class SavedPublicationPersistenceAdapter implements SavedPublicationPort {

    private final SavedPublicationJpaRepository savedPublicationJpaRepository;

    public SavedPublicationPersistenceAdapter(SavedPublicationJpaRepository savedPublicationJpaRepository) {
        this.savedPublicationJpaRepository = savedPublicationJpaRepository;
    }

    @Override
    public Optional<SavedPublication> findByPublicationIdAndUtilisateurId(Long publicationId, Long utilisateurId) {
        return savedPublicationJpaRepository.findByPublication_IdAndUtilisateurId(publicationId, utilisateurId);
    }

    @Override
    public long countByPublicationId(Long publicationId) {
        return savedPublicationJpaRepository.countByPublication_Id(publicationId);
    }

    @Override
    public boolean existsByPublicationIdAndUtilisateurId(Long publicationId, Long utilisateurId) {
        return savedPublicationJpaRepository.existsByPublication_IdAndUtilisateurId(publicationId, utilisateurId);
    }

    @Override
    public Page<SavedPublication> findByUtilisateurId(Long utilisateurId, Pageable pageable) {
        return savedPublicationJpaRepository.findByUtilisateurIdOrderByCreatedAtDesc(utilisateurId, pageable);
    }

    @Override
    public SavedPublication save(SavedPublication savedPublication) {
        return savedPublicationJpaRepository.save(savedPublication);
    }

    @Override
    public void delete(SavedPublication savedPublication) {
        savedPublicationJpaRepository.delete(savedPublication);
    }
}
