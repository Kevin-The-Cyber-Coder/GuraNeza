# RBAC Permission Matrix

This document describes the intended Role-Based Access Control model for GuraNeza. Backend enforcement is authoritative; frontend guards are presentation only.

## Roles

| Role | Description |
|---|---|
| `SUPER_ADMIN` | Platform administrator. Manages marketplace operations and security-sensitive workflows. |
| `SELLER` | Approved shop owner. Manages own shop, products, and own orders. |
| `CUSTOMER` | Registered shopper. Manages own account, cart, and orders. |

## Core Rules

- **Authentication required** for protected resources.
- **Role authorization** is enforced server-side on every protected endpoint.
- **Resource ownership** is enforced for seller/customer-owned resources.
- **Account/shop status** is enforced; suspended/disabled accounts cannot access restricted functionality.
- **Audit logs** record critical administrative actions.

## Permission Summary

| Capability | SUPER_ADMIN | SELLER | CUSTOMER |
|---|---:|---:|---:|
| Review seller applications | Yes | No | No |
| Manage sellers/shops/customers status | Yes | No | No |
| Manage own shop | No | Yes | No |
| Manage own products | Moderate all | Own only | No |
| View orders | All | Own-product orders | Own orders |
| Update order status | Admin workflows | Permitted fulfillment for fully owned orders | No |
| View audit logs | Yes | No | No |
| Manage platform settings/security | Yes | No | No |

## Security Notes

- Do not trust client-provided role, owner, shop, or order IDs.
- Never expose plaintext passwords or raw invitation tokens in production responses.
- Sensitive actions must be audited with actor, action, entity, outcome, and metadata.
