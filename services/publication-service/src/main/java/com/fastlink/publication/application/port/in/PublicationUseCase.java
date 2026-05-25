package com.fastlink.publication.application.port.in;

import com.fastlink.publication.application.dto.publication.CreatePublicationRequest;
import com.fastlink.publication.application.dto.publication.PublicationResponse;
import java.util.List;

public interface PublicationUseCase {

    PublicationResponse createPublication(CreatePublicationRequest request);

    List<PublicationResponse> listPublications();
}
