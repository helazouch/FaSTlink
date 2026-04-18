package com.fastlink.request.infrastructure.persistence.jpa;

import com.fastlink.request.domain.model.SalleDemandee;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SalleDemandeeJpaRepository extends JpaRepository<SalleDemandee, Long> {

    List<SalleDemandee> findByEntiteId(Long entiteId);

    boolean existsByEntiteIdAndNomIgnoreCase(Long entiteId, String nom);

    boolean existsByEntiteIdAndNomIgnoreCaseAndIdNot(Long entiteId, String nom, Long id);
}
