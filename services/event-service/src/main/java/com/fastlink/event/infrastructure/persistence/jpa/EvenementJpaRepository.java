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

    List<Evenement> findByEntiteIdOrderByDebutAtDesc(Long entiteId);

    @Query("""
            select e
            from Evenement e
            where (:hasEntityFilter = false or e.entiteId = :entityId)
              and (:hasSearch = false
                or lower(e.titre) like :searchPattern
                or lower(coalesce(e.description, '')) like :searchPattern)
              and (:hasStatus = false
                or (:status = 'UPCOMING' and e.debutAt > :now)
                or (:status = 'ONGOING' and e.debutAt <= :now and e.finAt >= :now)
                or (:status = 'CLOSED' and e.finAt < :now))
            """)
    Page<Evenement> searchEvenements(
            @Param("hasEntityFilter") boolean hasEntityFilter,
            @Param("entityId") Long entityId,
            @Param("hasStatus") boolean hasStatus,
            @Param("status") String status,
            @Param("hasSearch") boolean hasSearch,
            @Param("searchPattern") String searchPattern,
            @Param("now") Instant now,
            Pageable pageable);
}
