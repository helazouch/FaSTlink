package com.fastlink.entity.infrastructure.persistence.jpa;

import com.fastlink.entity.domain.model.Entite;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EntiteJpaRepository extends JpaRepository<Entite, Long> {

    Optional<Entite> findByNomIgnoreCase(String nom);

    boolean existsByNomIgnoreCase(String nom);

    boolean existsByNomIgnoreCaseAndIdNot(String nom, Long id);
}
