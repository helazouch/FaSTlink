package com.fastlink.request.application.port.in;

import com.fastlink.request.application.dto.salle.CreateSalleDemandeeRequest;
import com.fastlink.request.application.dto.salle.SalleDemandeeResponse;
import com.fastlink.request.application.dto.salle.UpdateSalleDemandeeRequest;
import java.util.List;

public interface SalleDemandeeUseCase {

    SalleDemandeeResponse createSalle(CreateSalleDemandeeRequest request);

    SalleDemandeeResponse updateSalle(Long salleId, UpdateSalleDemandeeRequest request);

    void deleteSalle(Long salleId, Long utilisateurId);

    List<SalleDemandeeResponse> listSalles(Long entiteId);
}
