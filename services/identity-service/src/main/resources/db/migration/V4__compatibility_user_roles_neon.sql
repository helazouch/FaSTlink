CREATE TABLE IF NOT EXISTS utilisateur_roles (
    utilisateur_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (utilisateur_id, role_id),
    CONSTRAINT fk_utilisateur_roles_utilisateur
        FOREIGN KEY (utilisateur_id)
        REFERENCES utilisateurs (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_utilisateur_roles_role
        FOREIGN KEY (role_id)
        REFERENCES roles (id)
        ON DELETE CASCADE
);

DO $$
DECLARE
    source_user_column text;
    source_role_column text;
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'user_global_roles'
    ) THEN
        SELECT column_name
        INTO source_user_column
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'user_global_roles'
          AND column_name IN ('utilisateur_id', 'user_id')
        ORDER BY CASE column_name WHEN 'utilisateur_id' THEN 1 ELSE 2 END
        LIMIT 1;

        SELECT column_name
        INTO source_role_column
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'user_global_roles'
          AND column_name = 'role_id'
        LIMIT 1;

        IF source_user_column IS NOT NULL AND source_role_column IS NOT NULL THEN
            EXECUTE format(
                'INSERT INTO utilisateur_roles (utilisateur_id, role_id)
                 SELECT DISTINCT %I, %I
                 FROM user_global_roles
                 ON CONFLICT DO NOTHING',
                source_user_column,
                source_role_column
            );
        END IF;
    END IF;
END $$;
