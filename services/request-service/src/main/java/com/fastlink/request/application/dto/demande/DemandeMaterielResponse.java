package com.fastlink.request.application.dto.demande;

public record DemandeMaterielResponse(
        Long id,
        String libelle,
        Integer quantite,
        String details) {
}
