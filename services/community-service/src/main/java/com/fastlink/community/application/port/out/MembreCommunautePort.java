package com.fastlink.community.application.port.out;

import com.fastlink.community.domain.model.MembreCommunaute;
import java.util.List;
import java.util.Optional;

public interface MembreCommunautePort {

    Optional<MembreCommunaute> findByCommunauteIdAndUtilisateurId(Long communauteId, Long utilisateurId);

    List<MembreCommunaute> findByCommunauteId(Long communauteId);

    long countByCommunauteId(Long communauteId);

    boolean existsByCommunauteIdAndUtilisateurId(Long communauteId, Long utilisateurId);

    MembreCommunaute save(MembreCommunaute membreCommunaute);

    void delete(MembreCommunaute membreCommunaute);
}
