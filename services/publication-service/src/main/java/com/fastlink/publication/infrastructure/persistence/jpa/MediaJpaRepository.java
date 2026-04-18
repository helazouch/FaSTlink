package com.fastlink.publication.infrastructure.persistence.jpa;

import com.fastlink.publication.domain.model.Media;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MediaJpaRepository extends JpaRepository<Media, Long> {
}
