CREATE TABLE IF NOT EXISTS permissions (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(80) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role
        FOREIGN KEY (role_id)
        REFERENCES roles (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission
        FOREIGN KEY (permission_id)
        REFERENCES permissions (id)
        ON DELETE CASCADE
);

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

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(128) NOT NULL UNIQUE,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    replaced_by_token_id BIGINT,
    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES utilisateurs (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_refresh_tokens_replaced_by
        FOREIGN KEY (replaced_by_token_id)
        REFERENCES refresh_tokens (id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_permissions_code ON permissions (code);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);

INSERT INTO permissions (code, description) VALUES
    ('ADMIN_USER_MANAGE', 'Manage users'),
    ('ADMIN_ROLE_MANAGE', 'Manage platform roles'),
    ('ADMIN_PLATFORM_MODERATE', 'Moderate platform content'),
    ('ADMIN_CONFIG_MANAGE', 'Manage platform configurations'),
    ('ADMIN_AUDIT_READ', 'Access audit logs'),
    ('ADMIN_ANALYTICS_READ', 'Access global analytics'),
    ('ADMIN_DASHBOARD_ACCESS', 'Access admin dashboards'),
    ('ADMIN_ENTITY_MANAGE', 'Manage entities globally'),
    ('USER_AUTHENTICATE', 'Authenticate and access platform'),
    ('USER_PUBLICATION_READ', 'Read publications'),
    ('USER_EVENT_READ', 'Read events'),
    ('USER_REACT', 'React to publications'),
    ('USER_COMMENT', 'Comment on publications'),
    ('USER_NOTIFICATIONS', 'Receive notifications'),
    ('USER_DISCUSS', 'Participate in discussions'),
    ('USER_MESSAGE', 'Send messages'),
    ('USER_EVENT_PARTICIPATE', 'Participate in events'),
    ('USER_EVENT_INTEREST', 'Indicate event interest'),
    ('USER_FEEDBACK_SEND', 'Send private feedback')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'USER_AUTHENTICATE',
    'USER_PUBLICATION_READ',
    'USER_EVENT_READ',
    'USER_REACT',
    'USER_COMMENT',
    'USER_NOTIFICATIONS',
    'USER_DISCUSS',
    'USER_MESSAGE',
    'USER_EVENT_PARTICIPATE',
    'USER_EVENT_INTEREST',
    'USER_FEEDBACK_SEND'
)
WHERE r.name = 'USER'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'ADMIN_USER_MANAGE',
    'ADMIN_ROLE_MANAGE',
    'ADMIN_PLATFORM_MODERATE',
    'ADMIN_CONFIG_MANAGE',
    'ADMIN_AUDIT_READ',
    'ADMIN_ANALYTICS_READ',
    'ADMIN_DASHBOARD_ACCESS',
    'ADMIN_ENTITY_MANAGE',
    'USER_AUTHENTICATE',
    'USER_PUBLICATION_READ',
    'USER_EVENT_READ',
    'USER_REACT',
    'USER_COMMENT',
    'USER_NOTIFICATIONS',
    'USER_DISCUSS',
    'USER_MESSAGE',
    'USER_EVENT_PARTICIPATE',
    'USER_EVENT_INTEREST',
    'USER_FEEDBACK_SEND'
)
WHERE r.name = 'ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO user_global_roles (user_id, role_id)
SELECT utilisateur_id, role_id
FROM utilisateur_roles
ON CONFLICT DO NOTHING;

DROP TABLE IF EXISTS utilisateur_roles;
