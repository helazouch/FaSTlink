package com.fastlink.event.application.port.out;

import com.fastlink.event.domain.model.Evenement;
import java.util.List;
import java.util.Optional;

public interface EvenementPort {

    Evenement save(Evenement evenement);

    Optional<Evenement> findById(Long evenementId);

    List<Evenement> findAll();

    void delete(Evenement evenement);
}
