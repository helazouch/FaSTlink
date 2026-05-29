package com.fastlink.community.application.port.out;

import com.fastlink.community.domain.model.Communaute;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface CommunautePort {

    Communaute save(Communaute communaute);

    Optional<Communaute> findById(Long communauteId);

    List<Communaute> findAll();

    List<Communaute> findByEntiteIdIn(Set<Long> entiteIds);

    List<Communaute> findByEntiteId(Long entiteId);

    List<Communaute> findVisibleForUtilisateur(Long utilisateurId);

    boolean existsByNomIgnoreCase(String nom);

    boolean existsByNomIgnoreCaseAndIdNot(String nom, Long communauteId);

    void delete(Communaute communaute);
}
