CREATE TABLE IF NOT EXISTS evenements (
    id BIGSERIAL PRIMARY KEY,
    entite_id BIGINT NOT NULL,
    createur_utilisateur_id BIGINT NOT NULL,
    titre VARCHAR(180) NOT NULL,
    description VARCHAR(2000),
    lieu VARCHAR(255),
    debut_at TIMESTAMPTZ NOT NULL,
    fin_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_evenements_dates CHECK (fin_at > debut_at)
);

CREATE TABLE IF NOT EXISTS utilisateur_evenement (
    id BIGSERIAL PRIMARY KEY,
    evenement_id BIGINT NOT NULL,
    utilisateur_id BIGINT NOT NULL,
    statut VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_ue_evenement
        FOREIGN KEY (evenement_id)
        REFERENCES evenements (id)
        ON DELETE CASCADE,
    CONSTRAINT uq_ue_evenement_user UNIQUE (evenement_id, utilisateur_id),
    CONSTRAINT ck_ue_statut CHECK (statut IN ('INTERESTED', 'PARTICIPATING'))
);

CREATE TABLE IF NOT EXISTS feedback_evenement (
    id BIGSERIAL PRIMARY KEY,
    evenement_id BIGINT NOT NULL,
    utilisateur_id BIGINT NOT NULL,
    note INT NOT NULL,
    commentaire VARCHAR(1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_fe_evenement
        FOREIGN KEY (evenement_id)
        REFERENCES evenements (id)
        ON DELETE CASCADE,
    CONSTRAINT uq_fe_evenement_user UNIQUE (evenement_id, utilisateur_id),
    CONSTRAINT ck_fe_note CHECK (note BETWEEN 1 AND 5)
);

CREATE INDEX IF NOT EXISTS idx_evenements_entite ON evenements (entite_id);
CREATE INDEX IF NOT EXISTS idx_evenements_createur ON evenements (createur_utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_evenements_debut_at ON evenements (debut_at);
CREATE INDEX IF NOT EXISTS idx_ue_evenement ON utilisateur_evenement (evenement_id);
CREATE INDEX IF NOT EXISTS idx_ue_utilisateur ON utilisateur_evenement (utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_fe_evenement ON feedback_evenement (evenement_id);
CREATE INDEX IF NOT EXISTS idx_fe_utilisateur ON feedback_evenement (utilisateur_id);
