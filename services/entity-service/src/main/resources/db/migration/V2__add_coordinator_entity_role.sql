ALTER TABLE utilisateur_role_entite
    DROP CONSTRAINT IF EXISTS ck_ure_role;

ALTER TABLE utilisateur_role_entite
    ADD CONSTRAINT ck_ure_role
        CHECK (role IN ('OWNER', 'COORDINATOR', 'MANAGER', 'MEMBER', 'VIEWER'));
