package com.fastlink.publication.application.port.in;

import com.fastlink.publication.application.dto.publication.CreatePublicationRequest;
import com.fastlink.publication.application.dto.publication.PublicationResponse;

public interface PublicationUseCase {

    PublicationResponse createPublication(CreatePublicationRequest request);
}
