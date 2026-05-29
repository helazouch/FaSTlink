package com.fastlink.community.application.port.in;

import com.fastlink.community.application.dto.communaute.CommunauteResponse;
import com.fastlink.community.application.dto.communaute.CreateCommunauteRequest;
import com.fastlink.community.application.dto.communaute.UpdateCommunauteRequest;
import java.util.List;
import java.util.Set;

public interface CommunauteUseCase {

    CommunauteResponse createCommunaute(CreateCommunauteRequest request);

    List<CommunauteResponse> listCommunautes();

    List<CommunauteResponse> listVisibleCommunautes(Long utilisateurId);

    List<CommunauteResponse> listCommunautesByEntite(Long entiteId);

    List<CommunauteResponse> listCommunautesByEntite(Long entiteId, Set<Long> activeEntityIds, boolean admin);

    CommunauteResponse getCommunaute(Long communauteId);

    CommunauteResponse getVisibleCommunaute(Long communauteId, Long utilisateurId);

    CommunauteResponse updateCommunaute(Long communauteId, UpdateCommunauteRequest request);

    void deleteCommunaute(Long communauteId, Long utilisateurId);
}
