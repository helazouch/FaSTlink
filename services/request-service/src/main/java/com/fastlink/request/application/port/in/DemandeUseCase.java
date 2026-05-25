package com.fastlink.request.application.port.in;

import com.fastlink.request.application.dto.demande.DecisionDemandeRequest;
import com.fastlink.request.application.dto.demande.DemandeResponse;
import com.fastlink.request.application.dto.demande.SubmitDemandeRequest;
import java.util.List;

public interface DemandeUseCase {

    List<DemandeResponse> listDemandes(Long utilisateurId, Long entiteId);

    DemandeResponse submitDemande(SubmitDemandeRequest request);

    DemandeResponse approveDemande(Long demandeId, DecisionDemandeRequest request);

    DemandeResponse rejectDemande(Long demandeId, DecisionDemandeRequest request);
}
