package com.fastlink.publication.infrastructure.persistence.jpa;

import com.fastlink.publication.domain.model.Publication;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PublicationJpaRepository extends JpaRepository<Publication, Long> {

    List<Publication> findAllByOrderByCreatedAtDesc();
}
