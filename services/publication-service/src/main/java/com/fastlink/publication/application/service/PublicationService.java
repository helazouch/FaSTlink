package com.fastlink.publication.application.service;

import com.fastlink.publication.application.dto.publication.CreatePublicationRequest;
import com.fastlink.publication.application.dto.publication.PublicationResponse;
import com.fastlink.publication.application.port.in.PublicationUseCase;
import com.fastlink.publication.application.port.out.EntityPermissionPort;
import com.fastlink.publication.application.port.out.PublicationEventPort;
import com.fastlink.publication.application.port.out.PublicationPort;
import com.fastlink.publication.domain.model.Publication;
import java.util.HashSet;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PublicationService implements PublicationUseCase {

    private static final String ACTION_CREATE_PUBLICATION = "PUBLICATION_CREATE";

    private final PublicationPort publicationPort;
    private final EntityPermissionPort entityPermissionPort;
    private final PublicationEventPort publicationEventPort;

    public PublicationService(
            PublicationPort publicationPort,
            EntityPermissionPort entityPermissionPort,
            PublicationEventPort publicationEventPort) {
        this.publicationPort = publicationPort;
        this.entityPermissionPort = entityPermissionPort;
        this.publicationEventPort = publicationEventPort;
    }

    @Override
    public PublicationResponse createPublication(CreatePublicationRequest request) {
        for (Long entiteId : request.entiteIds()) {
            entityPermissionPort.checkPermission(request.utilisateurId(), entiteId, ACTION_CREATE_PUBLICATION);
        }

        Publication publication = new Publication(
                request.utilisateurId(),
                normalizeContenu(request.contenu()),
                new HashSet<>(request.entiteIds()));

        Publication saved = publicationPort.save(publication);
        publicationEventPort.publishPublicationCreated(saved);

        return toResponse(saved);
    }

    private PublicationResponse toResponse(Publication publication) {
        return new PublicationResponse(
                publication.getId(),
                publication.getUtilisateurId(),
                publication.getContenu(),
                publication.getEntiteIds(),
                publication.getCreatedAt(),
                publication.getUpdatedAt());
    }

    private String normalizeContenu(String contenu) {
        return contenu == null ? null : contenu.trim();
    }
}
