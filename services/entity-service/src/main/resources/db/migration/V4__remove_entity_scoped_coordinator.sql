DELETE FROM entity_memberships
WHERE entity_role = 'COORDINATOR';

ALTER TABLE entity_memberships
DROP CONSTRAINT IF EXISTS ck_entity_memberships_role;

ALTER TABLE entity_memberships
ADD CONSTRAINT ck_entity_memberships_role
CHECK (entity_role IN ('SIMPLE_MEMBER', 'BUREAU_MEMBER'));
