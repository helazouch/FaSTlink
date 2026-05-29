package com.fastlink.community.infrastructure.persistence.jpa;

import com.fastlink.community.domain.model.Communaute;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunauteJpaRepository extends JpaRepository<Communaute, Long> {

    List<Communaute> findAllByOrderByCreatedAtDesc();

    List<Communaute> findByEntiteIdOrderByCreatedAtDesc(Long entiteId);

    boolean existsByNomIgnoreCase(String nom);

    boolean existsByNomIgnoreCaseAndIdNot(String nom, Long id);
}
