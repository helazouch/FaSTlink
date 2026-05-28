# Security Hardening

## Identity tokens

- Access JWTs include a `jti` claim, issuer validation, issued-at, expiration, global roles, global permissions, entity memberships, and entity permissions.
- Refresh tokens are stored only as SHA-256 hashes.
- Refresh tokens rotate on every `/api/v1/auth/refresh` call.
- Reuse of a previously rotated refresh token is treated as suspicious activity. The identity service revokes the active refresh-token family for that user and returns `401`.
- Logout revokes the submitted refresh token and, when an Authorization bearer token is present, writes the current access-token `jti` to the `access_token_revocations` blacklist until its natural expiration.

## Gateway controls

- `X-Correlation-Id` is accepted from callers or generated at the gateway and propagated downstream.
- Gateway request logs include method, path, status, duration, principal, and correlation ID.
- Security audit logs are emitted for write operations and denied/throttled requests.
- Rate limiting emits structured warnings when a client exceeds the configured policy.

## RBAC scenarios to preserve

- `SIMPLE_MEMBER` can read/participate but cannot see or call management actions.
- `BUREAU_MEMBER` management is scoped to the selected entity only.
- `COORDINATOR` is supervisory and does not inherit bureau-management UI or permissions.
- `ADMIN` remains the only global administrative role.
- Cross-entity writes must be denied unless the token has the required entity-scoped permission or an explicit admin override applies.

## Deployment notes

- Configure `JWT_SECRET_BASE64` with a strong base64-encoded HMAC secret in every service and the gateway.
- Keep `JWT_ISSUER` identical across issuer and resource services.
- Enable gateway rate limiting in production with `RATE_LIMIT_ENABLED=true`.
- Centralize logs from gateway and services so `correlationId` can be searched across the request path.
