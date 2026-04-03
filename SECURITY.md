# Security Policy — UnyKorn DC-OS

## Supported Versions

| Version | Supported |
|---|---|
| 2026.1.x (main) | ✅ Active |
| < 2026.1 | ❌ End of life |

---

## Reporting a Vulnerability

**DO NOT open a public GitHub issue for security vulnerabilities.**

Please report all security concerns privately to:

📧 **security@fthtrading.com**

Include in your report:
- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested fix (optional but appreciated)

You will receive an acknowledgement within **48 hours** and a full response within **7 business days**.

---

## Security Architecture

### Authentication
- All routes require `getServerSession(authOptions)` — no unauthenticated mutations possible
- Passwords hashed with **bcrypt** at 12 salt rounds
- JWT sessions with configurable expiry (default 24h)
- No persistent refresh tokens stored in DB

### Authorization
- Role-based: `ADMIN | ANALYST | VIEWER`
- Roles enforced at both API route and UI component level
- `createdById` ownership tracking on all Site records

### Input Validation
- All API route bodies validated with **Zod** schemas before processing
- Prisma parameterized queries — SQL injection impossible by construction

### Output Security
- React/Next.js escapes all rendered content — XSS prevented by default
- API responses never expose raw DB errors to clients (logged server-side only)

### File Handling
- Uploaded files stored under `FILE_STORAGE_PATH` with sanitized `storageKey` (UUID-based)
- No user-controlled path traversal possible
- File content read only by server-side agent processes

### SSRF Prevention
- Scraping restricted to `SCRAPE_ALLOWED_HOSTS` environment variable allowlist
- Wildcard `*` prohibited in production configuration

### Audit Trail
- Immutable `AuditLog` table — every state-changing operation is recorded
- Includes `userId`, `action`, `entityType`, `entityId`, `before`/`after` JSON diff, and UTC timestamp
- AuditLog records are never deleted

---

## OWASP Top 10 Mitigation Status

| # | Risk | Status |
|---|---|---|
| A01 | Broken Access Control | ✅ Mitigated — `getServerSession()` on all mutations |
| A02 | Cryptographic Failures | ✅ Mitigated — bcrypt-12, no plaintext secrets stored |
| A03 | Injection | ✅ Mitigated — Prisma parameterized queries + Zod validation |
| A04 | Insecure Design | ✅ Mitigated — defense-in-depth, audit logging |
| A05 | Security Misconfiguration | ⚠️ Operator responsibility — see deployment checklist |
| A06 | Vulnerable Components | ⚠️ Monitor — run `npm audit` regularly |
| A07 | Auth Failures | ✅ Mitigated — NextAuth + bcrypt, no credential logging |
| A08 | Software Integrity | ✅ Mitigated — lockfile committed, no eval() usage |
| A09 | Logging Failures | ✅ Mitigated — AuditLog on all mutations |
| A10 | SSRF | ✅ Mitigated — SCRAPE_ALLOWED_HOSTS allowlist |

---

## Production Security Checklist

- [ ] `NEXTAUTH_SECRET` is a cryptographically random 32+ byte string
- [ ] `DATABASE_URL` uses SSL (`?sslmode=require`)
- [ ] All seed passwords changed before first production access
- [ ] `SCRAPE_ALLOWED_HOSTS` is set to a specific allowlist (not `*`)
- [ ] File storage is outside the web root and not publicly accessible
- [ ] `NODE_ENV=production` is set
- [ ] PostgreSQL does not accept connections from `0.0.0.0`
- [ ] `npx prisma migrate deploy` used in prod (not `migrate dev`)
