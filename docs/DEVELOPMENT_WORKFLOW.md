# GuraNeza Development Workflow

This document is the source of truth for how GuraNeza is developed, reviewed, and released.
It applies to every contributor and every change, including small fixes.

---

## 1. Repository layout

| Remote | URL | Purpose |
|---|---|---|
| `origin` | `https://github.com/Kevin-The-Cyber-Coder/GuraNeza.git` | Primary repository (admin access). All branches and PRs live here. |
| `upstream` | `https://github.com/MK-kennedy/GuraNeza.git` | Original project repository (write access). Optional sync target. |

Add the upstream remote once per clone:

```bash
git remote add upstream https://github.com/MK-kennedy/GuraNeza.git
git fetch upstream
```

Never re-initialise the repository, rewrite shared history, or force-push `main` or `develop`.

---

## 2. Branch model

```
main        production-ready, always deployable
develop     integration branch for completed features
feature/*   one independent feature
fix/*       non-urgent bug fixes
refactor/*  behaviour-preserving restructuring
docs/*      documentation only
test/*      test coverage only
chore/*     tooling, dependencies, configuration
hotfix/*    urgent production fixes, branched from main
```

Rules:

- `main` is never developed on directly.
- Feature work starts from an up-to-date `develop`.
- Hotfixes start from `main`, merge back into both `main` and `develop`.
- A branch contains one concern. Unrelated work goes on a new branch.
- Delete branches after merge.

### Branch naming examples

```
feature/seller-applications
feature/seller-invitation-activation
feature/shop-management
feature/product-management
feature/multi-vendor-checkout
feature/wishlist
feature/product-reviews
feature/coupons
feature/flash-sales
fix/seller-order-ownership
security/rbac-server-enforcement
```

---

## 3. Standard workflow

```bash
# 1. Start from the integration branch
git checkout develop
git pull origin develop

# 2. Create a focused branch
git checkout -b feature/shop-management

# 3. Implement in small, meaningful steps
#    ... edit code ...
git add <files>
git commit -m "feat(shop): add shop model and slug generation"

# 4. Keep the branch current
git fetch origin
git rebase origin/develop   # or merge, if the branch is already shared

# 5. Verify before pushing
npm run lint
npm run test:server
npm run build:client

# 6. Push and open a Pull Request into develop
git push -u origin feature/shop-management
gh pr create --base develop --fill

# 7. After review and green checks, merge (squash or merge commit)
gh pr merge --merge --delete-branch

# 8. Release: develop -> main through a Pull Request
gh pr create --base main --head develop --title "release: promote develop"
```

---

## 4. Commit convention

[Conventional Commits](https://www.conventionalcommits.org/) are required.

```
<type>(<scope>): <short imperative description>
```

| Type | Use |
|---|---|
| `feat` | new functionality |
| `fix` | bug fix |
| `refactor` | restructuring without behaviour change |
| `style` | formatting only |
| `test` | tests |
| `docs` | documentation |
| `perf` | performance |
| `security` | security hardening |
| `chore` | tooling, dependencies, configuration |
| `build` | build system |
| `ci` | continuous integration |

Examples:

```
feat(auth): add seller role and activation state
feat(shop): implement seller shop creation
fix(order): restrict seller suborders to their owner
security(rbac): enforce resource ownership on the server
test(checkout): cover multi-vendor order splitting
docs(api): document seller application endpoints
```

Rules:

- One logical change per commit.
- The message explains **why**, not just what.
- Never commit secrets, `.env` files, tokens, or credentials.
- Never create empty commits or split one change artificially to inflate the history.
- Commit progressively; do not batch an entire feature into one commit.

### Commit-count policy

The project tracks a long-term goal of 500+ genuine commits and 100+ PRs.
The count is achieved only through real implementation, tests, documentation, refactoring, and maintenance.
History manipulation, duplicated changes, and artificial splitting are prohibited.
Progress is measured with `git rev-list --count --all` and reported honestly.

---

## 5. Pull Request requirements

Every PR must include:

- Feature name and objective.
- Summary of the implementation.
- Files and modules affected.
- Database and migration changes.
- API changes.
- Security considerations.
- Testing performed and how to reproduce it.
- Screenshots for UI changes.
- Known limitations and follow-up work.

Required checks:

- `lint`
- `test:server`
- `build:client`
- No unresolved conflicts.
- No secrets in the diff.

The template is in `.github/pull_request_template.md`.

---

## 6. Continuous integration

`.github/workflows/ci.yml` runs on:

- Every pull request targeting `develop` or `main`.
- Every push to `develop` or `main`.

Jobs:

1. **Lint** — ESLint across server and client.
2. **Test** — Vitest + Supertest against an in-memory MongoDB replica set.
3. **Build** — production Vite build.

A red check blocks merging. Never disable a failing check to force a merge.

---

## 7. Database and migration policy

- Production data is never deleted or re-seeded.
- Schema changes are additive and backwards compatible.
- Every data backfill is an idempotent migration in `server/src/migrations/`.
- Migrations are recorded in a `_migrations` collection and run on server boot.
- Destructive seed scripts refuse to run when `NODE_ENV=production`.
- Multi-document writes use MongoDB transactions (Atlas replica set or a local single-node replica set).

---

## 8. Environment and secrets

- `.env` files are local only and git-ignored.
- `.env.example` documents every variable with placeholder values only.
- Production secrets live in the Render dashboard, never in the repository.
- If a secret is ever committed, rotate it immediately and scrub the file.

Required variables are documented in `server/.env.example` and validated at boot by `server/src/config/env.js`.

---

## 9. Definition of done

A feature is complete only when:

- It works end-to-end against the real database and API.
- Server-side authorization is enforced (not just hidden UI).
- Validation, error handling, loading, empty, and success states exist.
- Tests cover the critical paths and authorization rules.
- Documentation is updated.
- `lint`, `test:server`, and `build:client` pass.
- The PR is reviewed and merged into `develop`.

---

## 10. Useful commands

```bash
npm run dev            # run API + client
npm run lint           # lint everything
npm run test:server    # backend test suite
npm run build:client   # production build
npm run seed           # seed the development database (blocked in production)
npm run git:status     # branch, tree, and sync overview
npm run git:sync       # fetch, rebase on develop, show status
```

See `docs/ARCHITECTURE.md` for the system design and `docs/API.md` for endpoints.
