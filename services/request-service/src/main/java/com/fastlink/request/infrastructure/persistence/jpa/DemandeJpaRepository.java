package com.fastlink.request.infrastructure.persistence.jpa;

import com.fastlink.request.domain.model.Demande;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DemandeJpaRepository extends JpaRepository<Demande, Long> {

    @Override
    @EntityGraph(attributePaths = { "materiels", "reservations", "reservations.salleDemandee" })
    Optional<Demande> findById(Long id);
}
