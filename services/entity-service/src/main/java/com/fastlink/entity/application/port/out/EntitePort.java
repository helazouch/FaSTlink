package com.fastlink.entity.application.port.out;

import com.fastlink.entity.domain.model.Entite;
import java.util.Optional;

public interface EntitePort {

    Entite save(Entite entite);

    Optional<Entite> findById(Long entiteId);

    boolean existsByNomIgnoreCase(String nom);

    boolean existsByNomIgnoreCaseAndIdNot(String nom, Long entiteId);

    void delete(Entite entite);
}
