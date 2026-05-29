package com.fastlink.community.application.port.in;

import com.fastlink.community.application.dto.communaute.CommunauteResponse;
import com.fastlink.community.application.dto.communaute.CreateCommunauteRequest;
import com.fastlink.community.application.dto.communaute.UpdateCommunauteRequest;
import java.util.List;

public interface CommunauteUseCase {

    CommunauteResponse createCommunaute(CreateCommunauteRequest request);

    List<CommunauteResponse> listCommunautes();

    List<CommunauteResponse> listCommunautesByEntite(Long entiteId);

    CommunauteResponse getCommunaute(Long communauteId);

    CommunauteResponse updateCommunaute(Long communauteId, UpdateCommunauteRequest request);

    void deleteCommunaute(Long communauteId, Long utilisateurId);
}
