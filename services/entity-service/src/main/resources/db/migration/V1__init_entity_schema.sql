CREATE TABLE IF NOT EXISTS entites (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(120) NOT NULL UNIQUE,
    description VARCHAR(1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS utilisateur_role_entite (
    id BIGSERIAL PRIMARY KEY,
    entite_id BIGINT NOT NULL,
    utilisateur_id BIGINT NOT NULL,
    role VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_ure_entite
        FOREIGN KEY (entite_id)
        REFERENCES entites (id)
        ON DELETE CASCADE,
    CONSTRAINT uq_ure_entite_user UNIQUE (entite_id, utilisateur_id),
    CONSTRAINT ck_ure_role CHECK (role IN ('OWNER', 'MANAGER', 'MEMBER', 'VIEWER'))
);

CREATE INDEX IF NOT EXISTS idx_entites_nom ON entites (nom);
CREATE INDEX IF NOT EXISTS idx_ure_entite ON utilisateur_role_entite (entite_id);
CREATE INDEX IF NOT EXISTS idx_ure_utilisateur ON utilisateur_role_entite (utilisateur_id);
