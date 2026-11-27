# Changelog

All notable changes to GuraNeza are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows Semantic Versioning where practical.

## [Unreleased]

### Added
- Strict RBAC foundations with canonical roles (`SUPER_ADMIN`, `SELLER`, `CUSTOMER`) and legacy role normalization.
- Role-protected dashboards and routes for Admin, Seller, and Customer portals.
- Admin management APIs and pages for sellers, shops, customers, audit logs, and notifications.
- Seller order visibility endpoint with ownership filtering and permitted seller fulfillment status updates.
- Role-aware login/registration UX with customer-only public registration and seller application flow.
- Dashboard placeholder components for RBAC modules not yet backed by data workflows.

### Changed
- Admin/seller/customer navigation expanded to match RBAC module structure.
- Local development defaults set to localhost API/client configuration.

### Security
- Backend-enforced role authorization, ownership checks, and account-status validation.
- Audit logging for critical admin status changes and sensitive actions.
- Sellers can only access their own order data; mixed-order details are filtered to seller-owned items.

## [0.1.0] - 2026

### Added
- Initial GuraNeza MERN marketplace foundation.
- Storefront, authentication, product catalog, cart/checkout, order tracking, and contact flows.
- Admin dashboard, seller application flow, secure activation/invitation workflow, and deployment baseline.
