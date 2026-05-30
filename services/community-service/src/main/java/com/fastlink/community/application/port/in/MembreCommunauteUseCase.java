package com.fastlink.community.application.port.in;

import com.fastlink.community.application.dto.communaute.MyCommunauteResponse;
import com.fastlink.community.application.dto.membre.AddMembreRequest;
import com.fastlink.community.application.dto.membre.MembreCommunauteResponse;
import java.util.List;

public interface MembreCommunauteUseCase {

    MembreCommunauteResponse addMembre(Long communauteId, AddMembreRequest request);

    void removeMembre(Long communauteId, Long utilisateurId, Long acteurUtilisateurId);

    List<MembreCommunauteResponse> getMembres(Long communauteId);

    List<MyCommunauteResponse> getMyCommunautes(Long utilisateurId);
}
