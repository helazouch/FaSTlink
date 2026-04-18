package com.fastlink.request.application.port.out;

import com.fastlink.request.domain.model.SalleDemandee;
import java.util.List;
import java.util.Optional;

public interface SalleDemandeePort {

    SalleDemandee save(SalleDemandee salleDemandee);

    Optional<SalleDemandee> findById(Long salleId);

    List<SalleDemandee> findByEntiteId(Long entiteId);

    boolean existsByEntiteIdAndNomIgnoreCase(Long entiteId, String nom);

    boolean existsByEntiteIdAndNomIgnoreCaseAndIdNot(Long entiteId, String nom, Long salleId);
}
