CREATE TABLE IF NOT EXISTS salles_demandees (
    id BIGSERIAL PRIMARY KEY,
    entite_id BIGINT NOT NULL,
    nom VARCHAR(120) NOT NULL,
    capacite INT NOT NULL,
    localisation VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_salles_capacite CHECK (capacite > 0),
    CONSTRAINT uq_salles_entite_nom UNIQUE (entite_id, nom)
);

CREATE TABLE IF NOT EXISTS demandes (
    id BIGSERIAL PRIMARY KEY,
    entite_id BIGINT NOT NULL,
    demandeur_utilisateur_id BIGINT NOT NULL,
    objet VARCHAR(180) NOT NULL,
    description VARCHAR(2000),
    status VARCHAR(20) NOT NULL,
    decision_commentaire VARCHAR(1000),
    decideur_utilisateur_id BIGINT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decision_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_demandes_status CHECK (status IN ('SUBMITTED', 'APPROVED', 'REJECTED'))
);

CREATE TABLE IF NOT EXISTS demandes_materiel (
    id BIGSERIAL PRIMARY KEY,
    demande_id BIGINT NOT NULL,
    libelle VARCHAR(180) NOT NULL,
    quantite INT NOT NULL,
    details VARCHAR(1000),
    CONSTRAINT fk_dm_demande
        FOREIGN KEY (demande_id)
        REFERENCES demandes (id)
        ON DELETE CASCADE,
    CONSTRAINT ck_dm_quantite CHECK (quantite > 0)
);

CREATE TABLE IF NOT EXISTS reservation_salles (
    id BIGSERIAL PRIMARY KEY,
    demande_id BIGINT NOT NULL,
    salle_id BIGINT NOT NULL,
    debut_at TIMESTAMPTZ NOT NULL,
    fin_at TIMESTAMPTZ NOT NULL,
    note VARCHAR(1000),
    CONSTRAINT fk_rs_demande
        FOREIGN KEY (demande_id)
        REFERENCES demandes (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_rs_salle
        FOREIGN KEY (salle_id)
        REFERENCES salles_demandees (id),
    CONSTRAINT ck_rs_dates CHECK (fin_at > debut_at)
);

CREATE INDEX IF NOT EXISTS idx_salles_entite ON salles_demandees (entite_id);
CREATE INDEX IF NOT EXISTS idx_demandes_entite ON demandes (entite_id);
CREATE INDEX IF NOT EXISTS idx_demandes_status ON demandes (status);
CREATE INDEX IF NOT EXISTS idx_dm_demande ON demandes_materiel (demande_id);
CREATE INDEX IF NOT EXISTS idx_rs_demande ON reservation_salles (demande_id);
CREATE INDEX IF NOT EXISTS idx_rs_salle ON reservation_salles (salle_id);
