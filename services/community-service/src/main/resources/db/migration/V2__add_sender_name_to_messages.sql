ALTER TABLE messages_communaute
    ADD COLUMN IF NOT EXISTS sender_name VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_messages_communaute_utilisateur ON messages_communaute (utilisateur_id);
