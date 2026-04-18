package com.fastlink.community.infrastructure.persistence.jpa;

import com.fastlink.community.domain.model.Communaute;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunauteJpaRepository extends JpaRepository<Communaute, Long> {

    boolean existsByNomIgnoreCase(String nom);

    boolean existsByNomIgnoreCaseAndIdNot(String nom, Long id);
}
