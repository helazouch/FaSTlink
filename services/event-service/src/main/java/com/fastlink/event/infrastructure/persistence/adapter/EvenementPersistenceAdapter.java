package com.fastlink.event.infrastructure.persistence.adapter;

import com.fastlink.event.application.port.out.EvenementPort;
import com.fastlink.event.domain.model.Evenement;
import com.fastlink.event.infrastructure.persistence.jpa.EvenementJpaRepository;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class EvenementPersistenceAdapter implements EvenementPort {

    private final EvenementJpaRepository evenementJpaRepository;

    public EvenementPersistenceAdapter(EvenementJpaRepository evenementJpaRepository) {
        this.evenementJpaRepository = evenementJpaRepository;
    }

    @Override
    public Evenement save(Evenement evenement) {
        return evenementJpaRepository.save(evenement);
    }

    @Override
    public Optional<Evenement> findById(Long evenementId) {
        return evenementJpaRepository.findById(evenementId);
    }

    @Override
    public void delete(Evenement evenement) {
        evenementJpaRepository.delete(evenement);
    }
}
