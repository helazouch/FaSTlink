package com.fastlink.request.application.port.in;

import com.fastlink.request.application.dto.demande.DecisionDemandeRequest;
import com.fastlink.request.application.dto.demande.DemandeResponse;
import com.fastlink.request.application.dto.demande.SubmitDemandeRequest;

public interface DemandeUseCase {

    DemandeResponse submitDemande(SubmitDemandeRequest request);

    DemandeResponse approveDemande(Long demandeId, DecisionDemandeRequest request);

    DemandeResponse rejectDemande(Long demandeId, DecisionDemandeRequest request);
}
