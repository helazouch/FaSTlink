package com.fastlink.publication.application.service;

import com.fastlink.publication.application.dto.publication.CreatePublicationRequest;
import com.fastlink.publication.application.dto.publication.PublicationMediaResponse;
import com.fastlink.publication.application.dto.publication.PublicationResponse;
import com.fastlink.publication.application.exception.ForbiddenOperationException;
import com.fastlink.publication.application.port.in.PublicationUseCase;
import com.fastlink.publication.application.port.out.CommentairePort;
import com.fastlink.publication.application.port.out.EntityPermissionPort;
import com.fastlink.publication.application.port.out.MediaPort;
import com.fastlink.publication.application.port.out.PublicationEventPort;
import com.fastlink.publication.application.port.out.PublicationNotificationPort;
import com.fastlink.publication.application.port.out.PublicationPort;
import com.fastlink.publication.application.port.out.PublicationRecipientPort;
import com.fastlink.publication.application.port.out.ReactionPort;
import com.fastlink.publication.domain.model.Media;
import com.fastlink.publication.domain.model.Publication;
import com.fastlink.publication.domain.model.PublicationScope;
import com.fastlink.publication.domain.model.ReactionType;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PublicationService implements PublicationUseCase {

    private static final String ACTION_CREATE_PUBLICATION = "PUBLICATION_CREATE";

    private final PublicationPort publicationPort;
    private final MediaPort mediaPort;
    private final EntityPermissionPort entityPermissionPort;
    private final CommentairePort commentairePort;
    private final ReactionPort reactionPort;
    private final PublicationEventPort publicationEventPort;
    private final PublicationRecipientPort publicationRecipientPort;
    private final PublicationNotificationPort publicationNotificationPort;

    public PublicationService(
            PublicationPort publicationPort,
            MediaPort mediaPort,
            EntityPermissionPort entityPermissionPort,
            CommentairePort commentairePort,
            ReactionPort reactionPort,
            PublicationEventPort publicationEventPort,
            PublicationRecipientPort publicationRecipientPort,
            PublicationNotificationPort publicationNotificationPort) {
        this.publicationPort = publicationPort;
        this.mediaPort = mediaPort;
        this.entityPermissionPort = entityPermissionPort;
        this.commentairePort = commentairePort;
        this.reactionPort = reactionPort;
        this.publicationEventPort = publicationEventPort;
        this.publicationRecipientPort = publicationRecipientPort;
        this.publicationNotificationPort = publicationNotificationPort;
    }

    @Override
    public PublicationResponse createPublication(CreatePublicationRequest request) {
        return createPublication(request.utilisateurId(), request);
    }

    @Override
    public PublicationResponse createPublication(Long authenticatedUserId, CreatePublicationRequest request) {
        if (authenticatedUserId == null || authenticatedUserId <= 0) {
            throw new ForbiddenOperationException("Utilisateur authentifie introuvable");
        }

        Long publishingEntityId = request.publishingEntityId();
        PublicationScope scope = request.scope() == null ? PublicationScope.MY_ENTITY : request.scope();
        Set<Long> targetEntityIds = resolveTargetEntityIds(publishingEntityId, scope, request);
        String contenu = normalizeContenu(request.contenu());
        boolean hasMedia = request.media() != null && !request.media().isEmpty();

        if ((contenu == null || contenu.isBlank()) && !hasMedia) {
            throw new ForbiddenOperationException("Le contenu ou un media est requis");
        }

        entityPermissionPort.checkPermission(authenticatedUserId, publishingEntityId, ACTION_CREATE_PUBLICATION);
        validateSelectedEntitiesExist(targetEntityIds, publishingEntityId);

        Publication publication = new Publication(
                authenticatedUserId,
                contenu == null ? "" : contenu,
                publishingEntityId,
                scope,
                targetEntityIds);

        Publication saved = publicationPort.save(publication);
        if (request.media() != null) {
            request.media().forEach(item -> mediaPort.save(new Media(saved, item.url().trim(), item.type())));
        }
        publicationEventPort.publishPublicationCreated(saved);
        publicationNotificationPort.notifyPublicationCreated(saved, resolveRecipients(saved));

        return toResponse(saved, authenticatedUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PublicationResponse> listPublications() {
        return publicationPort.findAll().stream().map(publication -> toResponse(publication, null)).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PublicationResponse> searchPublications(Long entityId, Long authorId, String search, Pageable pageable) {
        return publicationPort.search(entityId, authorId, search, pageable)
                .map(publication -> toResponse(publication, null));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PublicationResponse> feedForUser(Long userId, boolean admin, Set<Long> activeEntityIds, Pageable pageable) {
        Page<Publication> page = publicationPort.findAll(pageable);
        List<PublicationResponse> visible = page.getContent().stream()
                .filter(publication -> isVisibleToUser(publication, admin, activeEntityIds))
                .map(publication -> toResponse(publication, userId))
                .toList();
        return new PageImpl<>(visible, pageable, page.getTotalElements());
    }

    private PublicationResponse toResponse(Publication publication, Long currentUserId) {
        Long publicationId = publication.getId();
        return new PublicationResponse(
                publicationId,
                publication.getUtilisateurId(),
                publication.getContenu(),
                publication.getPublishingEntityId(),
                publication.getScope(),
                publication.getEntiteIds(),
                mediaPort.findByPublicationId(publicationId).stream()
                        .map(media -> new PublicationMediaResponse(media.getId(), media.getUrl(), media.getType()))
                        .toList(),
                reactionPort.countByPublicationIdAndType(publicationId, ReactionType.LIKE),
                commentairePort.countByPublicationId(publicationId),
                currentUserId != null && reactionPort.existsByPublicationIdAndUtilisateurIdAndType(
                        publicationId,
                        currentUserId,
                        ReactionType.LIKE),
                publication.getCreatedAt(),
                publication.getUpdatedAt());
    }

    private Set<Long> resolveTargetEntityIds(
            Long publishingEntityId,
            PublicationScope scope,
            CreatePublicationRequest request) {
        return switch (scope) {
            case MY_ENTITY -> Set.of(publishingEntityId);
            case SELECTED_ENTITIES -> {
                Set<Long> selected = request.selectedEntityIds() == null ? request.entiteIds() : request.selectedEntityIds();
                if (selected == null || selected.isEmpty()) {
                    throw new ForbiddenOperationException("Au moins une entite cible est requise");
                }
                yield new HashSet<>(selected);
            }
            case ALL_ENTITIES, ALL_USERS -> new HashSet<>();
        };
    }

    private void validateSelectedEntitiesExist(Set<Long> entityIds, Long publishingEntityId) {
        Set<Long> toValidate = new HashSet<>(entityIds);
        toValidate.add(publishingEntityId);
        for (Long entityId : toValidate) {
            if (entityId == null || entityId <= 0) {
                throw new ForbiddenOperationException("Entite cible invalide");
            }
            entityPermissionPort.assertEntityExists(entityId);
        }
    }

    private boolean isVisibleToUser(Publication publication, boolean admin, Set<Long> activeEntityIds) {
        if (admin) {
            return true;
        }
        PublicationScope scope = publication.getScope() == null ? PublicationScope.MY_ENTITY : publication.getScope();
        return switch (scope) {
            case ALL_USERS -> true;
            case ALL_ENTITIES -> activeEntityIds != null && !activeEntityIds.isEmpty();
            case MY_ENTITY -> activeEntityIds != null && activeEntityIds.contains(publication.getPublishingEntityId());
            case SELECTED_ENTITIES -> activeEntityIds != null && publication.getEntiteIds().stream().anyMatch(activeEntityIds::contains);
        };
    }

    private Set<Long> resolveRecipients(Publication publication) {
        PublicationScope scope = publication.getScope() == null ? PublicationScope.MY_ENTITY : publication.getScope();
        Set<Long> recipients = new HashSet<>();
        switch (scope) {
            case MY_ENTITY -> recipients.addAll(publicationRecipientPort.findEntityMemberIds(publication.getPublishingEntityId()));
            case SELECTED_ENTITIES -> publication.getEntiteIds()
                    .forEach(entityId -> recipients.addAll(publicationRecipientPort.findEntityMemberIds(entityId)));
            case ALL_ENTITIES -> recipients.addAll(publicationRecipientPort.findAllEntityMemberIds());
            case ALL_USERS -> recipients.add(publication.getUtilisateurId());
        }
        recipients.remove(publication.getUtilisateurId());
        return recipients;
    }

    private String normalizeContenu(String contenu) {
        return contenu == null ? null : contenu.trim();
    }
}
