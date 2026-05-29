package com.fastlink.publication.application.port.out;

import com.fastlink.publication.domain.model.Reaction;
import com.fastlink.publication.domain.model.ReactionType;
import java.util.Optional;

public interface ReactionPort {

    Optional<Reaction> findByPublicationIdAndUtilisateurId(Long publicationId, Long utilisateurId);

    Optional<Reaction> findByPublicationIdAndUtilisateurIdAndType(Long publicationId, Long utilisateurId, ReactionType type);

    long countByPublicationIdAndType(Long publicationId, ReactionType type);

    boolean existsByPublicationIdAndUtilisateurIdAndType(Long publicationId, Long utilisateurId, ReactionType type);

    Reaction save(Reaction reaction);

    void delete(Reaction reaction);
}
