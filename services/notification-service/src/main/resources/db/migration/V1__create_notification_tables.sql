CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(80) NOT NULL,
    titre VARCHAR(200) NOT NULL,
    contenu VARCHAR(2000) NOT NULL,
    payload_json VARCHAR(12000),
    source_event_id VARCHAR(120),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS utilisateur_notifications (
    id BIGSERIAL PRIMARY KEY,
    notification_id BIGINT NOT NULL,
    utilisateur_id BIGINT NOT NULL,
    lu BOOLEAN NOT NULL DEFAULT FALSE,
    lu_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_utilisateur_notifications_notification
        FOREIGN KEY (notification_id)
        REFERENCES notifications (id)
        ON DELETE CASCADE,

    CONSTRAINT uk_utilisateur_notifications_notification_user
        UNIQUE (notification_id, utilisateur_id)
);

CREATE INDEX IF NOT EXISTS idx_utilisateur_notifications_user
    ON utilisateur_notifications (utilisateur_id);

CREATE INDEX IF NOT EXISTS idx_utilisateur_notifications_user_lu
    ON utilisateur_notifications (utilisateur_id, lu);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
    ON notifications (created_at DESC);
