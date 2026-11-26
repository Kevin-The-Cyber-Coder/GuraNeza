# Security policy

## Supported versions

| Version | Supported |
|---|---|
| `main` (latest) | ✅ |
| Older commits / forks | ❌ |

Security fixes land on `main` and are documented in the changelog.

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Report privately through GitHub:

1. Go to the repository's **Security** tab.
2. Choose **Report a vulnerability** (private security advisory).
3. Describe the issue, the affected endpoint or page, reproduction steps and potential impact.

You can also email **hello@guraneza.rw** with the subject `SECURITY`.

### What to expect

| Stage | Target |
|---|---|
| Acknowledgement | Within 3 business days |
| Initial assessment | Within 7 business days |
| Fix or mitigation plan | Communicated after triage |

Please give us reasonable time to fix the issue before any public disclosure. Reporters are credited in the advisory unless they prefer not to be.

## Scope

In scope:

- Authentication and authorisation bypasses (including direct object references)
- Privilege escalation between `customer`, `seller` and `admin`
- Injection, unsafe deserialisation, SSRF
- Exposure of secrets, tokens or personal data
- Order, pricing or stock manipulation
- Seller onboarding flaws (invitation reuse, expiry bypass)
- Upload handling issues

Out of scope:

- Missing security headers on demo environments without sensitive data
- Rate-limit thresholds that only affect convenience
- Denial of service through unrealistic traffic volumes
- Vulnerabilities in third-party services (report them upstream)

## Security practices in this repository

- Passwords hashed with bcrypt; password hashes never leave the API
- Stateless JWT auth signed with a server-only secret
- Role and resource-ownership checks on every sensitive route
- Zod validation on bodies, queries and params
- Helmet headers, strict CORS allow-list, rate limiting on auth and forms
- Server-side price, stock and total recalculation at checkout
- Seller invitation tokens stored as SHA-256 hashes, single-use, with expiry
- Privileged actions recorded in an audit log
- `.env` files git-ignored; only placeholder templates are committed

If you believe any of these controls is implemented incorrectly, that is a valid report.
