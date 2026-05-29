INSERT INTO membres_communaute (communaute_id, utilisateur_id, role, created_at, updated_at)
SELECT c.id, c.createur_utilisateur_id, 'ADMIN', NOW(), NOW()
FROM communautes c
WHERE NOT EXISTS (
    SELECT 1
    FROM membres_communaute m
    WHERE m.communaute_id = c.id
      AND m.utilisateur_id = c.createur_utilisateur_id
);
