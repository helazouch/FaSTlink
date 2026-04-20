package com.fastlink.request.application.port.out;

import com.fastlink.request.domain.model.Demande;
import java.util.List;
import java.util.Optional;

public interface DemandePort {

    Demande save(Demande demande);

    List<Demande> findAll();

    List<Demande> findByDemandeurUtilisateurId(Long utilisateurId);

    List<Demande> findByEntiteId(Long entiteId);

    Optional<Demande> findById(Long demandeId);
}
