# Security model

- Helmet security headers
- ValidationPipe with whitelist/transform
- JWT access-token foundation
- RBAC role model
- Prisma parameterization for SQL safety
- Rate-limiting insertion point
- AuditLog entity
- Media metadata validation insertion point
- CORS configuration
- Production secrets must come from a secret manager

Recommended production controls:
- Cloudflare WAF + bot management
- short-lived access tokens + rotating refresh tokens
- WebAuthn/2FA for privileged staff
- IP/device anomaly detection
- CSP with nonce/hash policy
- Redis-backed rate limiting
- antivirus/media scanning
- immutable audit log shipping
- encrypted backups and quarterly restore tests
