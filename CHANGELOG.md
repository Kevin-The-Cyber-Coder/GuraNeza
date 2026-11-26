# Changelog

All notable changes to GuraNeza are documented here. Entries are grouped by the milestone they shipped in and follow the repository history.

---

## [Unreleased]

- In-app notifications and notification preferences (in progress)
- Multi-vendor checkout with per-shop suborders (designed in `docs/ARCHITECTURE.md`)

---

## 2026-11-26 — Seller marketplace

### Added

- Seller product management: create, edit, archive, delete and upload images for own products
- Product scoping: products belong to a shop and a seller, with `draft` / `published` / `archived` status
- Public catalogue now only lists published products, with related items filtered to published
- Seller dashboard and shop profile management (branding, contact, location, logo and cover uploads)
- Local image storage middleware with MIME, size and magic-byte validation
- Seller product and shop test suites covering ownership rules

### Changed

- Product routes accept seller access alongside admin, with ownership guards on update and delete
- Audit entries recorded for product create, update, delete and image changes

---

## 2026-11-22 — Roles, security baseline and seller onboarding

### Added

- `customer`, `seller` and `admin` roles with `protect`, `authorize(...roles)` and ownership middleware
- Idempotent migration runner and a migration that upgrades legacy `user` accounts to `customer`
- Environment validation (Zod) at boot, Helmet, CORS allow-list and rate limiting
- Seller applications with reference numbers, admin review, approval and rejection reasons
- Single-use, expiring seller invitations delivered by email, with activation flow
- Transactional email through Resend
- Audit log for privileged actions
- Authentication and RBAC test suites

### Security

- Removed real credentials from the environment template
- Invitation tokens stored as SHA-256 hashes; raw tokens only exist in the email link

---

## 2026-11-18 — Deployment and storefront polish

### Added

- Render deployment for the API and the static frontend
- Developer credits and a first-visit welcome modal
- Postman collection, environment and live API test report
- SPA deep-link support

### Fixed

- Native form submit on the registration page
- Clarified that the Render rewrite must be a rewrite, not a redirect

---

## 2026-11-17 — Initial release

### Added

- Monorepo scaffold with shared tooling, lockfiles and line-ending rules
- Express API: JWT authentication, products, orders, contacts and dashboard analytics
- Mongoose models for users, products, orders and contacts
- Storefront: home, catalogue, product detail, cart, checkout, tracking and account pages
- Admin console: dashboard, products, orders, messages
- Seed script with a demo administrator, customer, 16 products, orders and messages
- ESLint, Prettier, Husky, lint-staged and GitHub Actions CI
- Setup, API and workflow documentation
