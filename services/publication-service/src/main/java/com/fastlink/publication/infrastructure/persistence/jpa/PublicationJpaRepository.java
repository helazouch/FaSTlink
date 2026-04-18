package com.fastlink.publication.infrastructure.persistence.jpa;

import com.fastlink.publication.domain.model.Publication;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PublicationJpaRepository extends JpaRepository<Publication, Long> {
}
