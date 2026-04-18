CREATE TABLE IF NOT EXISTS communautes (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(140) NOT NULL UNIQUE,
    description VARCHAR(1200),
    createur_utilisateur_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS membres_communaute (
    id BIGSERIAL PRIMARY KEY,
    communaute_id BIGINT NOT NULL,
    utilisateur_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_membres_communaute_communaute
        FOREIGN KEY (communaute_id)
        REFERENCES communautes (id)
        ON DELETE CASCADE,
    CONSTRAINT uq_membres_communaute UNIQUE (communaute_id, utilisateur_id),
    CONSTRAINT ck_membres_role CHECK (role IN ('ADMIN', 'MEMBER'))
);

CREATE TABLE IF NOT EXISTS messages_communaute (
    id BIGSERIAL PRIMARY KEY,
    communaute_id BIGINT NOT NULL,
    utilisateur_id BIGINT NOT NULL,
    contenu VARCHAR(1500) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_messages_communaute_communaute
        FOREIGN KEY (communaute_id)
        REFERENCES communautes (id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_membres_communaute_communaute ON membres_communaute (communaute_id);
CREATE INDEX IF NOT EXISTS idx_membres_communaute_utilisateur ON membres_communaute (utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_messages_communaute_communaute ON messages_communaute (communaute_id);
CREATE INDEX IF NOT EXISTS idx_messages_communaute_created_at ON messages_communaute (created_at);
