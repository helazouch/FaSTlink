package com.fastlink.request.application.port.out;

import com.fastlink.request.domain.model.Demande;
import java.util.Optional;

public interface DemandePort {

    Demande save(Demande demande);

    Optional<Demande> findById(Long demandeId);
}
