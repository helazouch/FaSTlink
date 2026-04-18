package com.fastlink.event.infrastructure.persistence.jpa;

import com.fastlink.event.domain.model.Evenement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EvenementJpaRepository extends JpaRepository<Evenement, Long> {
}
