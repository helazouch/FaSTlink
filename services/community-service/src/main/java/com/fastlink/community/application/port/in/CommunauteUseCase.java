package com.fastlink.community.application.port.in;

import com.fastlink.community.application.dto.communaute.CommunauteResponse;
import com.fastlink.community.application.dto.communaute.CreateCommunauteRequest;
import com.fastlink.community.application.dto.communaute.UpdateCommunauteRequest;

public interface CommunauteUseCase {

    CommunauteResponse createCommunaute(CreateCommunauteRequest request);

    CommunauteResponse updateCommunaute(Long communauteId, UpdateCommunauteRequest request);

    void deleteCommunaute(Long communauteId, Long utilisateurId);
}
