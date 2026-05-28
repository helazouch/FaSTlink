CREATE TABLE IF NOT EXISTS access_token_revocations (
    token_id VARCHAR(80) PRIMARY KEY,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_token_revocations_expires_at
    ON access_token_revocations (expires_at);
