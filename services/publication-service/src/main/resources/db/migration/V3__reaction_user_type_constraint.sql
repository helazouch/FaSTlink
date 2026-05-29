ALTER TABLE reactions
    DROP CONSTRAINT IF EXISTS uq_reactions_publication_user;

ALTER TABLE reactions
    ADD CONSTRAINT uq_reactions_publication_user_type UNIQUE (publication_id, utilisateur_id, type);
