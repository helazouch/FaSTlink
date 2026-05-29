package com.fastlink.publication.application.port.out;

import com.fastlink.publication.domain.model.Commentaire;
import java.util.List;

public interface CommentairePort {

    Commentaire save(Commentaire commentaire);

    List<Commentaire> findByPublicationIdOrderByCreatedAtAsc(Long publicationId);

    long countByPublicationId(Long publicationId);
}
