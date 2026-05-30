package com.fastlink.request.application.port.in;

import com.fastlink.request.application.dto.demande.DecisionDemandeRequest;
import com.fastlink.request.application.dto.demande.DemandeResponse;
import com.fastlink.request.application.dto.demande.SubmitDemandeRequest;
import com.fastlink.request.domain.model.DemandeStatus;
import com.fastlink.request.domain.model.DemandeType;
import java.util.List;

public interface DemandeUseCase {

    List<DemandeResponse> listDemandes(Long utilisateurId, Long entiteId);

    List<DemandeResponse> listMyEntityDemandes(Long actorUserId, Long entiteId);

    List<DemandeResponse> listProcessingQueue(Long actorUserId, boolean admin, boolean coordinator, DemandeStatus status, DemandeType type);

    DemandeResponse getDemande(Long actorUserId, boolean admin, boolean coordinator, Long demandeId);

    DemandeResponse submitDemande(Long actorUserId, SubmitDemandeRequest request);

    DemandeResponse markUnderReview(Long demandeId, Long actorUserId, boolean admin, boolean coordinator, DecisionDemandeRequest request);

    DemandeResponse approveDemande(Long demandeId, Long actorUserId, boolean admin, boolean coordinator, DecisionDemandeRequest request);

    DemandeResponse rejectDemande(Long demandeId, Long actorUserId, boolean admin, boolean coordinator, DecisionDemandeRequest request);
}
