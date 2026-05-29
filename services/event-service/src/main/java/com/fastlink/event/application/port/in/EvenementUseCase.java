package com.fastlink.event.application.port.in;

import com.fastlink.event.application.dto.evenement.CreateEvenementRequest;
import com.fastlink.event.application.dto.evenement.EvenementResponse;
import com.fastlink.event.application.dto.evenement.UpdateEvenementRequest;
import java.util.List;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EvenementUseCase {

    EvenementResponse createEvenement(CreateEvenementRequest request);

    List<EvenementResponse> listVisibleEvenements(Long currentUserId, boolean admin, Set<Long> activeEntityIds);

    List<EvenementResponse> listEvenementsForEntityManagement(Long entiteId, Long utilisateurId, boolean admin);

    Page<EvenementResponse> searchEvenements(
            Long entityId,
            String status,
            String search,
            Pageable pageable,
            Long currentUserId,
            boolean admin,
            Set<Long> activeEntityIds);

    EvenementResponse getVisibleEvenement(Long evenementId, Long currentUserId, boolean admin, Set<Long> activeEntityIds);

    EvenementResponse updateEvenement(Long evenementId, UpdateEvenementRequest request);

    void deleteEvenement(Long evenementId, Long utilisateurId);
}
