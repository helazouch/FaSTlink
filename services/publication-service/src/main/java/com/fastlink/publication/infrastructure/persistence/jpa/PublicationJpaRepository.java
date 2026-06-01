package com.fastlink.publication.infrastructure.persistence.jpa;

import com.fastlink.publication.domain.model.Publication;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PublicationJpaRepository extends JpaRepository<Publication, Long> {

    List<Publication> findAllByOrderByCreatedAtDesc();

    @Query("""
            select distinct p
            from Publication p
            where (:entityId is null or :entityId member of p.entiteIds)
              and (:authorId is null or p.utilisateurId = :authorId)
            """)
    Page<Publication> searchPublicationsWithoutText(
            @Param("entityId") Long entityId,
            @Param("authorId") Long authorId,
            Pageable pageable);

    @Query("""
            select distinct p
            from Publication p
            where (:entityId is null or :entityId member of p.entiteIds)
              and (:authorId is null or p.utilisateurId = :authorId)
              and (:search is null or lower(p.contenu) like lower(concat('%', :search, '%')))
            """)
    Page<Publication> searchPublications(
            @Param("entityId") Long entityId,
            @Param("authorId") Long authorId,
            @Param("search") String search,
            Pageable pageable);
}
