package com.fastlink.community.application.port.out;

import com.fastlink.community.domain.model.Communaute;
import java.util.Optional;

public interface CommunautePort {

    Communaute save(Communaute communaute);

    Optional<Communaute> findById(Long communauteId);

    boolean existsByNomIgnoreCase(String nom);

    boolean existsByNomIgnoreCaseAndIdNot(String nom, Long communauteId);

    void delete(Communaute communaute);
}
