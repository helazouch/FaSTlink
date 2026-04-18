CREATE TABLE IF NOT EXISTS publications (
    id BIGSERIAL PRIMARY KEY,
    utilisateur_id BIGINT NOT NULL,
    contenu VARCHAR(2000) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS publication_entites_cibles (
    publication_id BIGINT NOT NULL,
    entite_id BIGINT NOT NULL,
    PRIMARY KEY (publication_id, entite_id),
    CONSTRAINT fk_publication_entites_cibles_publication
        FOREIGN KEY (publication_id)
        REFERENCES publications (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS medias (
    id BIGSERIAL PRIMARY KEY,
    publication_id BIGINT NOT NULL,
    url VARCHAR(500) NOT NULL,
    type VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_medias_publication
        FOREIGN KEY (publication_id)
        REFERENCES publications (id)
        ON DELETE CASCADE,
    CONSTRAINT ck_medias_type CHECK (type IN ('IMAGE', 'VIDEO', 'DOCUMENT'))
);

CREATE TABLE IF NOT EXISTS commentaires (
    id BIGSERIAL PRIMARY KEY,
    publication_id BIGINT NOT NULL,
    utilisateur_id BIGINT NOT NULL,
    contenu VARCHAR(1000) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_commentaires_publication
        FOREIGN KEY (publication_id)
        REFERENCES publications (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reactions (
    id BIGSERIAL PRIMARY KEY,
    publication_id BIGINT NOT NULL,
    utilisateur_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_reactions_publication
        FOREIGN KEY (publication_id)
        REFERENCES publications (id)
        ON DELETE CASCADE,
    CONSTRAINT uq_reactions_publication_user UNIQUE (publication_id, utilisateur_id),
    CONSTRAINT ck_reactions_type CHECK (type IN ('LIKE', 'LOVE', 'WOW', 'SAD', 'ANGRY'))
);

CREATE INDEX IF NOT EXISTS idx_publications_utilisateur ON publications (utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_pec_entite ON publication_entites_cibles (entite_id);
CREATE INDEX IF NOT EXISTS idx_medias_publication ON medias (publication_id);
CREATE INDEX IF NOT EXISTS idx_commentaires_publication ON commentaires (publication_id);
CREATE INDEX IF NOT EXISTS idx_commentaires_utilisateur ON commentaires (utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_reactions_publication ON reactions (publication_id);
CREATE INDEX IF NOT EXISTS idx_reactions_utilisateur ON reactions (utilisateur_id);
