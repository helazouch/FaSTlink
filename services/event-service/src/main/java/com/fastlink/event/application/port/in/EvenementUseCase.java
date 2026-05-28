package com.fastlink.event.application.port.in;

import com.fastlink.event.application.dto.evenement.CreateEvenementRequest;
import com.fastlink.event.application.dto.evenement.EvenementResponse;
import com.fastlink.event.application.dto.evenement.UpdateEvenementRequest;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EvenementUseCase {

    EvenementResponse createEvenement(CreateEvenementRequest request);

    List<EvenementResponse> listEvenements();

    Page<EvenementResponse> searchEvenements(Long entityId, String status, String search, Pageable pageable);

    EvenementResponse updateEvenement(Long evenementId, UpdateEvenementRequest request);

    void deleteEvenement(Long evenementId, Long utilisateurId);
}
