CREATE TABLE IF NOT EXISTS user_global_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_global_roles_user
        FOREIGN KEY (user_id)
        REFERENCES utilisateurs (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_user_global_roles_role
        FOREIGN KEY (role_id)
        REFERENCES roles (id)
        ON DELETE CASCADE
);

DO $$
BEGIN
    IF to_regclass('utilisateur_roles') IS NOT NULL THEN
        INSERT INTO user_global_roles (user_id, role_id)
        SELECT utilisateur_id, role_id
        FROM utilisateur_roles
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

DROP TABLE IF EXISTS utilisateur_roles;
