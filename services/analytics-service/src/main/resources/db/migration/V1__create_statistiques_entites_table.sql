CREATE TABLE IF NOT EXISTS statistiques_entites (
    id BIGSERIAL PRIMARY KEY,
    entite_id BIGINT NOT NULL,
    interactions BIGINT NOT NULL DEFAULT 0,
    participation BIGINT NOT NULL DEFAULT 0,
    engagement BIGINT NOT NULL DEFAULT 0,
    source_event_id VARCHAR(120),
    source_event_type VARCHAR(120) NOT NULL,
    payload_json VARCHAR(12000),
    occurred_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uk_statistiques_entites_entite_event
        UNIQUE (entite_id, source_event_id)
);

CREATE INDEX IF NOT EXISTS idx_statistiques_entites_entite_created
    ON statistiques_entites (entite_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_statistiques_entites_event_type
    ON statistiques_entites (source_event_type);
