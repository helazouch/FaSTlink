CREATE TABLE IF NOT EXISTS publication_saves (
    id BIGSERIAL PRIMARY KEY,
    publication_id BIGINT NOT NULL,
    utilisateur_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_publication_saves_publication
        FOREIGN KEY (publication_id)
        REFERENCES publications (id)
        ON DELETE CASCADE,
    CONSTRAINT uq_publication_saves_publication_user UNIQUE (publication_id, utilisateur_id)
);

CREATE INDEX IF NOT EXISTS idx_publication_saves_publication ON publication_saves (publication_id);
CREATE INDEX IF NOT EXISTS idx_publication_saves_utilisateur ON publication_saves (utilisateur_id);
