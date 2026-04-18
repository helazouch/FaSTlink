package com.fastlink.publication.infrastructure.persistence.adapter;

import com.fastlink.publication.application.port.out.ReactionPort;
import com.fastlink.publication.domain.model.Reaction;
import com.fastlink.publication.infrastructure.persistence.jpa.ReactionJpaRepository;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class ReactionPersistenceAdapter implements ReactionPort {

    private final ReactionJpaRepository reactionJpaRepository;

    public ReactionPersistenceAdapter(ReactionJpaRepository reactionJpaRepository) {
        this.reactionJpaRepository = reactionJpaRepository;
    }

    @Override
    public Optional<Reaction> findByPublicationIdAndUtilisateurId(Long publicationId, Long utilisateurId) {
        return reactionJpaRepository.findByPublication_IdAndUtilisateurId(publicationId, utilisateurId);
    }

    @Override
    public Reaction save(Reaction reaction) {
        return reactionJpaRepository.save(reaction);
    }
}
