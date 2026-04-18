package com.fastlink.analytics.infrastructure.persistence.repository;

import com.fastlink.analytics.domain.model.StatistiquesEntite;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StatistiquesEntiteJpaRepository extends JpaRepository<StatistiquesEntite, Long> {

    Optional<StatistiquesEntite> findFirstByEntiteIdOrderByCreatedAtDesc(Long entiteId);

    List<StatistiquesEntite> findByEntiteIdOrderByCreatedAtDesc(Long entiteId, Pageable pageable);

    boolean existsByEntiteIdAndSourceEventId(Long entiteId, String sourceEventId);
}
