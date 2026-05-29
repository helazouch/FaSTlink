package com.fastlink.publication.application.port.in;

import com.fastlink.publication.application.dto.publication.CreatePublicationRequest;
import com.fastlink.publication.application.dto.publication.PublicationResponse;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PublicationUseCase {

    PublicationResponse createPublication(CreatePublicationRequest request);

    PublicationResponse createPublication(Long authenticatedUserId, CreatePublicationRequest request);

    List<PublicationResponse> listPublications();

    Page<PublicationResponse> searchPublications(Long entityId, Long authorId, String search, Pageable pageable);

    Page<PublicationResponse> feedForUser(Long userId, boolean admin, java.util.Set<Long> activeEntityIds, Pageable pageable);

    Page<PublicationResponse> savedForUser(Long userId, boolean admin, java.util.Set<Long> activeEntityIds, Pageable pageable);
}
