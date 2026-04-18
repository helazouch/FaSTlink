package com.fastlink.entity.infrastructure.persistence.jpa;

import com.fastlink.entity.domain.model.Entite;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EntiteJpaRepository extends JpaRepository<Entite, Long> {

    boolean existsByNomIgnoreCase(String nom);

    boolean existsByNomIgnoreCaseAndIdNot(String nom, Long id);
}
