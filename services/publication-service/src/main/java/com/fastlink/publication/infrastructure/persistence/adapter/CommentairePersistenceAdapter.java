package com.fastlink.publication.infrastructure.persistence.adapter;

import com.fastlink.publication.application.port.out.CommentairePort;
import com.fastlink.publication.domain.model.Commentaire;
import com.fastlink.publication.infrastructure.persistence.jpa.CommentaireJpaRepository;
import org.springframework.stereotype.Component;

@Component
public class CommentairePersistenceAdapter implements CommentairePort {

    private final CommentaireJpaRepository commentaireJpaRepository;

    public CommentairePersistenceAdapter(CommentaireJpaRepository commentaireJpaRepository) {
        this.commentaireJpaRepository = commentaireJpaRepository;
    }

    @Override
    public Commentaire save(Commentaire commentaire) {
        return commentaireJpaRepository.save(commentaire);
    }

    @Override
    public long countByPublicationId(Long publicationId) {
        return commentaireJpaRepository.countByPublication_Id(publicationId);
    }
}
