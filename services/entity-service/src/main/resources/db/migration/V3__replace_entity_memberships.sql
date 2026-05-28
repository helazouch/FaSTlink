CREATE TABLE IF NOT EXISTS entity_memberships (
    id BIGSERIAL PRIMARY KEY,
    entity_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    entity_role VARCHAR(30) NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by BIGINT,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_entity_memberships_entite
        FOREIGN KEY (entity_id)
        REFERENCES entites (id)
        ON DELETE CASCADE,
    CONSTRAINT uq_entity_memberships_entity_user UNIQUE (entity_id, user_id),
    CONSTRAINT ck_entity_memberships_role CHECK (entity_role IN ('SIMPLE_MEMBER', 'BUREAU_MEMBER', 'COORDINATOR')),
    CONSTRAINT ck_entity_memberships_status CHECK (status IN ('ACTIVE', 'REVOKED'))
);

CREATE INDEX IF NOT EXISTS idx_entity_memberships_entity ON entity_memberships (entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_memberships_user ON entity_memberships (user_id);

INSERT INTO entity_memberships (entity_id, user_id, entity_role, assigned_at, status)
SELECT
    entite_id,
    utilisateur_id,
    CASE role
        WHEN 'OWNER' THEN 'BUREAU_MEMBER'
        WHEN 'MANAGER' THEN 'BUREAU_MEMBER'
        WHEN 'MEMBER' THEN 'SIMPLE_MEMBER'
        WHEN 'VIEWER' THEN 'SIMPLE_MEMBER'
        WHEN 'COORDINATOR' THEN 'COORDINATOR'
        ELSE 'SIMPLE_MEMBER'
    END AS entity_role,
    created_at,
    'ACTIVE'
FROM utilisateur_role_entite;

DROP TABLE IF EXISTS utilisateur_role_entite;
