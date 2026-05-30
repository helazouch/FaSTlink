CREATE INDEX IF NOT EXISTS idx_statistiques_entites_occurred_type
    ON statistiques_entites (occurred_at DESC, source_event_type);

CREATE INDEX IF NOT EXISTS idx_statistiques_entites_entite_occurred
    ON statistiques_entites (entite_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_statistiques_entites_request_payload
    ON statistiques_entites (source_event_type, occurred_at DESC)
    WHERE source_event_type IN ('request.submitted', 'request.approved', 'request.rejected');
