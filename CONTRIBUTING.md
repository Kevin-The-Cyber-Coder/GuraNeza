# Contributing to GuraNeza

Thanks for taking the time to contribute. This project follows a review-first workflow: small, focused pull requests with tests and documentation.

---

## Code of conduct

Be respectful and constructive. Harassment, discrimination and personal attacks are not tolerated in issues, pull requests or discussions.

---

## Getting started

```bash
git clone https://github.com/Kevin-The-Cyber-Coder/GuraNeza.git
cd GuraNeza
npm run install:all
cp server/.env.example server/.env      # then set MONGO_URI and JWT_SECRET
npm run seed
npm run dev
```

| Service | URL |
|---|---|
| Storefront | <http://localhost:5173> |
| API | <http://localhost:5000/api/health> |

See the [README](../README.md) for environment variables and database notes.

---

## Branch model

| Branch | Purpose |
|---|---|
| `main` | Production-ready, always deployable |
| `develop` | Integration branch for completed work |
| `feature/*` | One feature |
| `fix/*` | Non-urgent bug fixes |
| `refactor/*` | Behaviour-preserving changes |
| `docs/*`, `test/*`, `chore/*` | Documentation, tests, tooling |
| `hotfix/*` | Urgent production fixes, branched from `main` |

Work starts from an up-to-date `develop`:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature
```

Do not develop directly on `main`, rewrite shared history, or force-push protected branches.

---

## Commit messages

[Conventional Commits](https://www.conventionalcommits.org/) are required:

```text
<type>(<scope>): <short imperative description>
```

| Type | Use |
|---|---|
| `feat` | New functionality |
| `fix` | Bug fix |
| `refactor` | Restructuring without behaviour change |
| `style` | Formatting only |
| `test` | Tests |
| `docs` | Documentation |
| `perf` | Performance |
| `security` | Hardening |
| `chore` | Tooling, dependencies, configuration |
| `build` / `ci` | Build system, pipelines |

Examples:

```text
feat(shop): add shop slug generation
fix(order): restore stock when a suborder is cancelled
security(rbac): enforce product ownership on update
docs(api): document seller invitation endpoints
```

One logical change per commit. Explain **why** in the body. Never commit secrets, `.env` files or credentials.

---

## Before opening a pull request

```bash
npm run lint
npm run test:server
npm run build:client
```

A pull request is ready when:

- The change is limited to one concern
- Server-side authorisation is enforced (not only hidden in the UI)
- Validation, loading, empty and error states are handled
- New behaviour has tests, and existing tests still pass
- Documentation is updated (README, `docs/API.md`, `docs/ARCHITECTURE.md`)
- UI changes include a screenshot
- No secrets, build output or unrelated files are included

Fill in the pull request template completely.

---

## Code style

- **Server**: ES modules, `asyncHandler`, controllers thin and explicit, Zod validation for every input, centralised error handling.
- **Client**: function components and hooks, context providers for cross-cutting state, shared helpers in `client/src/utils`.
- **CSS**: the design system in `client/src/index.css` is extended, not replaced. Reuse existing tokens and utility classes.
- Formatting is enforced by Prettier and ESLint (`npm run format`, `npm run lint`).

---

## Reporting bugs and requesting features

Use the GitHub issue templates. Include reproduction steps, expected vs actual behaviour, and environment details. For security issues, follow [SECURITY.md](../SECURITY.md) instead of opening a public issue.

---

## Questions

Open a discussion or contact the maintainers listed in the README.
