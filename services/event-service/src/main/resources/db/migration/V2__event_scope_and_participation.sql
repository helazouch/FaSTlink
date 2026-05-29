ALTER TABLE evenements
    ADD COLUMN IF NOT EXISTS scope VARCHAR(32) NOT NULL DEFAULT 'MY_ENTITY',
    ADD COLUMN IF NOT EXISTS image_url TEXT,
    ADD COLUMN IF NOT EXISTS capacity INT,
    ADD COLUMN IF NOT EXISTS category VARCHAR(120);

CREATE TABLE IF NOT EXISTS event_entites_cibles (
    evenement_id BIGINT NOT NULL,
    entite_id BIGINT NOT NULL,
    PRIMARY KEY (evenement_id, entite_id),
    CONSTRAINT fk_event_entites_cibles_evenement
        FOREIGN KEY (evenement_id)
        REFERENCES evenements (id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_evenements_scope ON evenements (scope);

UPDATE utilisateur_evenement
SET statut = 'GOING'
WHERE statut = 'PARTICIPATING';

ALTER TABLE utilisateur_evenement DROP CONSTRAINT IF EXISTS ck_ue_statut;

ALTER TABLE utilisateur_evenement
    ADD CONSTRAINT ck_ue_statut CHECK (statut IN ('INTERESTED', 'GOING', 'NOT_GOING'));
