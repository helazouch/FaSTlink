package com.fastlink.publication.infrastructure.persistence.jpa;

import com.fastlink.publication.domain.model.Media;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MediaJpaRepository extends JpaRepository<Media, Long> {

    List<Media> findByPublication_IdOrderByCreatedAtAsc(Long publicationId);
}
