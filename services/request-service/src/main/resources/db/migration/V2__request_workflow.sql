ALTER TABLE demandes DROP CONSTRAINT IF EXISTS ck_demandes_status;

ALTER TABLE demandes
    ADD COLUMN IF NOT EXISTS request_type VARCHAR(40) NOT NULL DEFAULT 'MATERIAL_REQUEST',
    ADD COLUMN IF NOT EXISTS date_debut DATE,
    ADD COLUMN IF NOT EXISTS date_fin DATE,
    ADD COLUMN IF NOT EXISTS heure_debut TIME,
    ADD COLUMN IF NOT EXISTS heure_fin TIME;

ALTER TABLE demandes
    ADD CONSTRAINT ck_demandes_status
    CHECK (status IN ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'));

ALTER TABLE reservation_salles DROP CONSTRAINT IF EXISTS ck_rs_dates;

ALTER TABLE reservation_salles
    ALTER COLUMN salle_id DROP NOT NULL,
    ALTER COLUMN debut_at DROP NOT NULL,
    ALTER COLUMN fin_at DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS capacite_souhaitee INT,
    ADD COLUMN IF NOT EXISTS nom_salle_attribuee VARCHAR(180);

UPDATE reservation_salles rs
SET capacite_souhaitee = COALESCE(rs.capacite_souhaitee, sd.capacite),
    nom_salle_attribuee = COALESCE(rs.nom_salle_attribuee, sd.nom)
FROM salles_demandees sd
WHERE rs.salle_id = sd.id;

ALTER TABLE reservation_salles
    ADD CONSTRAINT ck_rs_dates
    CHECK (debut_at IS NULL OR fin_at IS NULL OR fin_at > debut_at);

CREATE INDEX IF NOT EXISTS idx_demandes_type ON demandes (request_type);
