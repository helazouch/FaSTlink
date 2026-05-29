package com.fastlink.publication.application.port.out;

import com.fastlink.publication.domain.model.SavedPublication;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SavedPublicationPort {

    Optional<SavedPublication> findByPublicationIdAndUtilisateurId(Long publicationId, Long utilisateurId);

    long countByPublicationId(Long publicationId);

    boolean existsByPublicationIdAndUtilisateurId(Long publicationId, Long utilisateurId);

    Page<SavedPublication> findByUtilisateurId(Long utilisateurId, Pageable pageable);

    SavedPublication save(SavedPublication savedPublication);

    void delete(SavedPublication savedPublication);
}
