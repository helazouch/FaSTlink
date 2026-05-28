ALTER TABLE communautes
    ADD COLUMN IF NOT EXISTS entite_id BIGINT;

UPDATE communautes
SET entite_id = id
WHERE entite_id IS NULL;

ALTER TABLE communautes
    ALTER COLUMN entite_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_communautes_entite ON communautes (entite_id);
