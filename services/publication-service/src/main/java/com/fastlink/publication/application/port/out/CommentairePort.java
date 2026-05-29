package com.fastlink.publication.application.port.out;

import com.fastlink.publication.domain.model.Commentaire;

public interface CommentairePort {

    Commentaire save(Commentaire commentaire);

    long countByPublicationId(Long publicationId);
}
