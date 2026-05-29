package com.fastlink.publication.application.port.out;

import com.fastlink.publication.domain.model.SavedPublication;
import java.util.Optional;

public interface SavedPublicationPort {

    Optional<SavedPublication> findByPublicationIdAndUtilisateurId(Long publicationId, Long utilisateurId);

    long countByPublicationId(Long publicationId);

    boolean existsByPublicationIdAndUtilisateurId(Long publicationId, Long utilisateurId);

    SavedPublication save(SavedPublication savedPublication);

    void delete(SavedPublication savedPublication);
}
