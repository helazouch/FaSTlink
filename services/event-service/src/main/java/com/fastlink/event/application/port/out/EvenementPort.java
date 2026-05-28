package com.fastlink.event.application.port.out;

import com.fastlink.event.domain.model.Evenement;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EvenementPort {

    Evenement save(Evenement evenement);

    Optional<Evenement> findById(Long evenementId);

    List<Evenement> findAll();

    Page<Evenement> search(Long entityId, String status, String search, Instant now, Pageable pageable);

    void delete(Evenement evenement);
}
