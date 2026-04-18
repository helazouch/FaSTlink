package com.fastlink.analytics.application.port.out;

import com.fastlink.analytics.domain.model.StatistiquesEntite;
import java.util.List;
import java.util.Optional;

public interface StatistiquesEntitePort {

    StatistiquesEntite save(StatistiquesEntite statistiquesEntite);

    Optional<StatistiquesEntite> findLatestByEntiteId(Long entiteId);

    List<StatistiquesEntite> findLatestByEntiteId(Long entiteId, int limit);

    boolean existsByEntiteIdAndSourceEventId(Long entiteId, String sourceEventId);
}
