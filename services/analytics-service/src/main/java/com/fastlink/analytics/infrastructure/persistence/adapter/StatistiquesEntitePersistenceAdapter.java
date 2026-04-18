package com.fastlink.analytics.infrastructure.persistence.adapter;

import com.fastlink.analytics.application.port.out.StatistiquesEntitePort;
import com.fastlink.analytics.domain.model.StatistiquesEntite;
import com.fastlink.analytics.infrastructure.persistence.repository.StatistiquesEntiteJpaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

@Component
public class StatistiquesEntitePersistenceAdapter implements StatistiquesEntitePort {

    private final StatistiquesEntiteJpaRepository statistiquesEntiteJpaRepository;

    public StatistiquesEntitePersistenceAdapter(StatistiquesEntiteJpaRepository statistiquesEntiteJpaRepository) {
        this.statistiquesEntiteJpaRepository = statistiquesEntiteJpaRepository;
    }

    @Override
    public StatistiquesEntite save(StatistiquesEntite statistiquesEntite) {
        return statistiquesEntiteJpaRepository.save(statistiquesEntite);
    }

    @Override
    public Optional<StatistiquesEntite> findLatestByEntiteId(Long entiteId) {
        return statistiquesEntiteJpaRepository.findFirstByEntiteIdOrderByCreatedAtDesc(entiteId);
    }

    @Override
    public List<StatistiquesEntite> findLatestByEntiteId(Long entiteId, int limit) {
        return statistiquesEntiteJpaRepository.findByEntiteIdOrderByCreatedAtDesc(entiteId, PageRequest.of(0, limit));
    }

    @Override
    public boolean existsByEntiteIdAndSourceEventId(Long entiteId, String sourceEventId) {
        return statistiquesEntiteJpaRepository.existsByEntiteIdAndSourceEventId(entiteId, sourceEventId);
    }
}
