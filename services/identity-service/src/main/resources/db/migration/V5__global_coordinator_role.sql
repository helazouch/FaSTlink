INSERT INTO roles (name) VALUES ('COORDINATOR')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (code, description) VALUES
    ('ENTITY_MANAGE', 'Manage entities globally'),
    ('PUBLICATION_MODERATE', 'Moderate publications globally'),
    ('PUBLICATION_CREATE', 'Create coordinator publications'),
    ('EVENT_CREATE', 'Create coordinator events'),
    ('EVENT_UPDATE', 'Update coordinator events'),
    ('EVENT_DELETE', 'Delete coordinator events'),
    ('COMMUNITY_MANAGE', 'Manage coordinator communities'),
    ('ENTITY_MEMBER_MANAGE', 'Manage members under coordinator policy'),
    ('REQUEST_APPROVE', 'Approve requests'),
    ('REQUEST_REJECT', 'Reject requests'),
    ('ROOM_MANAGE', 'Manage room assignments'),
    ('ANALYTICS_VIEW', 'View advanced analytics'),
    ('OPERATIONS_OVERSIGHT', 'Oversee platform operations'),
    ('CLUB_SUPERVISE', 'Supervise entities')
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
    'USER_FEEDBACK_SEND',
    'ENTITY_MANAGE',
    'PUBLICATION_MODERATE',
    'PUBLICATION_CREATE',
    'EVENT_CREATE',
    'EVENT_UPDATE',
    'EVENT_DELETE',
    'COMMUNITY_MANAGE',
    'ENTITY_MEMBER_MANAGE',
    'REQUEST_APPROVE',
    'REQUEST_REJECT',
    'ROOM_MANAGE',
    'ANALYTICS_VIEW',
    'OPERATIONS_OVERSIGHT',
    'CLUB_SUPERVISE'
)
WHERE r.name = 'COORDINATOR'
ON CONFLICT DO NOTHING;
