package com.fastlink.publication.application.port.out;

import com.fastlink.publication.domain.model.Reaction;
import java.util.Optional;

public interface ReactionPort {

    Optional<Reaction> findByPublicationIdAndUtilisateurId(Long publicationId, Long utilisateurId);

    Reaction save(Reaction reaction);
}
