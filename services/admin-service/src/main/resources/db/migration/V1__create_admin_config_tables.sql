CREATE TABLE IF NOT EXISTS global_configs (
    id BIGSERIAL PRIMARY KEY,
    config_key VARCHAR(120) NOT NULL UNIQUE,
    config_value VARCHAR(4000) NOT NULL,
    description VARCHAR(500),
    updated_by_user_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_global_configs_key
    ON global_configs (config_key);

CREATE INDEX IF NOT EXISTS idx_global_configs_updated_at
    ON global_configs (updated_at DESC);

CREATE TABLE IF NOT EXISTS platform_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(120) NOT NULL UNIQUE,
    setting_value VARCHAR(4000) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    description VARCHAR(500),
    updated_by_user_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_settings_key
    ON platform_settings (setting_key);

CREATE INDEX IF NOT EXISTS idx_platform_settings_enabled
    ON platform_settings (enabled);

CREATE INDEX IF NOT EXISTS idx_platform_settings_updated_at
    ON platform_settings (updated_at DESC);
