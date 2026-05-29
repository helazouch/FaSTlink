ALTER TABLE publications
    ADD COLUMN IF NOT EXISTS publishing_entity_id BIGINT,
    ADD COLUMN IF NOT EXISTS scope VARCHAR(32) NOT NULL DEFAULT 'MY_ENTITY';

UPDATE publications
SET publishing_entity_id = first_target.entite_id
FROM (
    SELECT publication_id, MIN(entite_id) AS entite_id
    FROM publication_entites_cibles
    GROUP BY publication_id
) first_target
WHERE publications.id = first_target.publication_id
  AND publications.publishing_entity_id IS NULL;

ALTER TABLE medias
    ALTER COLUMN url TYPE TEXT;

CREATE INDEX IF NOT EXISTS idx_publications_scope ON publications (scope);
CREATE INDEX IF NOT EXISTS idx_publications_publishing_entity ON publications (publishing_entity_id);
