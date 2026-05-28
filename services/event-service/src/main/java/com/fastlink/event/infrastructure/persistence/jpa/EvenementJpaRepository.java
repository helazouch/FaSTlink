package com.fastlink.event.infrastructure.persistence.jpa;

import com.fastlink.event.domain.model.Evenement;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EvenementJpaRepository extends JpaRepository<Evenement, Long> {

    List<Evenement> findAllByOrderByDebutAtAsc();

    @Query("""
            select e
            from Evenement e
            where (:entityId is null or e.entiteId = :entityId)
              and (:search is null
                or lower(e.titre) like lower(concat('%', :search, '%'))
                or lower(coalesce(e.description, '')) like lower(concat('%', :search, '%')))
              and (:status is null
                or (:status = 'UPCOMING' and e.debutAt > :now)
                or (:status = 'ONGOING' and e.debutAt <= :now and e.finAt >= :now)
                or (:status = 'CLOSED' and e.finAt < :now))
            """)
    Page<Evenement> searchEvenements(
            @Param("entityId") Long entityId,
            @Param("status") String status,
            @Param("search") String search,
            @Param("now") Instant now,
            Pageable pageable);
}
