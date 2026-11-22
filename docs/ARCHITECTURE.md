# GuraNeza Architecture

> Living document. Updated as each module lands.

---

## 1. System overview

```
React 18 + Vite (client/)
        |
        | HTTPS / JSON (JWT bearer)
        v
Express 4 REST API (server/)
        |
        +-- MongoDB (Mongoose 8)
        +-- Resend (transactional email)
        +-- Cloudinary (image storage)
```

- **Single repository**, two applications (`client`, `server`).
- **Stateless API** authenticated with JWTs; authorization is always enforced server-side.
- **MongoDB** is the source of truth. The browser never supplies trusted prices, totals, roles, or ownership.

---

## 2. Roles

| Role | Description |
|---|---|
| `customer` | Registers freely, shops, checks out, tracks own orders, manages own profile, addresses, wishlist and reviews. |
| `seller` | Created only through an approved seller application and a single-use activation link. Manages exactly one shop and its products, inventory, suborders, promotions, coupons and reviews. |
| `admin` | Super Admin. Approves sellers, manages customers, shops, products, categories, orders, payments, settings, announcements and audit logs. |

Legacy `user` accounts are migrated to `customer` by an idempotent migration.

---

## 3. Domain model (target)

### Identity and onboarding

- **User** — credentials, role, `isActive`, `sellerStatus`, profile, addresses, last login.
- **SellerApplication** — applicant details, business details, category, motivation, status (`pending|approved|rejected`), reference number, reviewer, rejection reason, timestamps.
- **SellerInvitation** — application/user, SHA-256 token hash, expiry, used-at, created-by. The raw token exists only in the email link.

### Marketplace

- **Shop** — one per seller, unique slug, logo, cover, description, category, contact, location, socials, status (`active|suspended|inactive`), rating aggregate, statistics.
- **Category** — admin-managed, slug, parent, icon, order, active flag. Replaces the hardcoded product enum while keeping a legacy string mirror.
- **Product** — shop, seller, name, slug, description, category reference, brand, price, promotional price, SKU, stock, status (`draft|pending|published|out_of_stock|rejected|archived`), rating aggregate, sold count.
- **ProductImage** — product, URL, public id, order.
- **ProductVariant** — product, name, value, optional price/stock override, SKU.
- **Review** — verified purchase only, product and/or shop, rating, comment, seller response.
- **WishlistItem** — user, target type (`product|shop`), target id.

### Commerce

- **Cart** / **CartItem** — server-side cart for authenticated customers, validated against stock and shop status.
- **Order** — parent order owned by one customer; totals, payment status, aggregate status, shipping snapshot.
- **SellerSuborder** — one per shop in a parent order; items, subtotal, discount, shipping share, status, timeline.
- **OrderItem** — product snapshot, quantity, unit price, discount allocation, suborder reference.
- **Payment** — order, method (`cod|mobile_money|bank_transfer`), status, reference, amount, timestamps.
- **Address** — customer delivery addresses with default flag.

### Growth

- **Coupon** — platform or shop scope, percentage or fixed amount, minimum spend, usage limits, start/end, active flag.
- **CouponRedemption** — coupon, user, order, amount, timestamp.
- **Promotion** (flash sale) — shop, products, discount, start/end, status.
- **Notification** — user, type, title, body, link, read-at.
- **AuditLog** — actor, action, entity, entity id, metadata, IP, timestamp.

---

## 4. Multi-vendor checkout

1. Customer cart is validated against current product, shop and stock state.
2. The server recomputes every price, promotion and coupon. Client totals are ignored.
3. Items are grouped by shop.
4. Inside one MongoDB transaction:
   - inventory is decremented with a guarded update (`stock >= quantity`),
   - one parent `Order` is created,
   - one `SellerSuborder` per shop is created,
   - `OrderItem` rows are written with price snapshots,
   - coupon redemption and payment records are written.
5. If any write fails, the transaction aborts and no stock is lost.
6. Sellers can read and update only their own suborders.
7. The parent order status is derived from suborder statuses.
8. Cancelling a suborder restocks only that shop's items.

---

## 5. API structure

```
/api/auth                 register, login, me, profile, password reset
/api/seller-applications  apply, list (admin), approve, reject
/api/seller-invitations   activate, resend
/api/shops                public discovery, seller CRUD, admin moderation
/api/products             public catalogue, seller CRUD, admin moderation
/api/categories           public list, admin CRUD
/api/cart                 customer cart
/api/checkout             place order
/api/orders               customer orders
/api/seller/orders        seller suborders
/api/admin/orders         all orders and suborders
/api/wishlist             customer wishlist
/api/reviews              product and shop reviews
/api/coupons              seller and admin coupons
/api/promotions           flash sales
/api/notifications        in-app notifications
/api/analytics            seller and admin metrics
/api/audit-logs           admin audit trail
```

Response envelope:

```json
{ "success": true, "data": {}, "message": "..." }
```

Errors use the same envelope with `success: false`, a human-readable `message`, and optional `errors[]` for field validation.

---

## 6. Security model

- Passwords hashed with bcrypt (cost 10+).
- JWTs signed with a server-only secret, short-lived, with refresh or re-login policy.
- Server-side `protect`, `authorize(...roles)`, and resource-ownership guards on every sensitive route.
- Rate limiting on auth, applications, checkout and review endpoints.
- Helmet security headers, strict CORS allowlist.
- Zod validation for every request body, query and params.
- Uploads validated by MIME type, size and magic bytes, stored in Cloudinary.
- Seller invitations: 32-byte random token, SHA-256 hash at rest, single use, configurable expiry.
- Audit logging for admin and seller actions.
- No secrets in the repository. `.env.example` contains placeholders only.

---

## 7. Frontend structure

```
client/src/
  components/        shared UI, guards, dashboard primitives
  context/           Auth, Cart, Toast, Notifications
  layouts/           Storefront, Admin, Seller, Account
  pages/
    storefront/      home, shops, shop, product, cart, checkout
    account/         profile, orders, tracking, addresses, wishlist, settings
    seller/          overview, shop, products, orders, inventory, analytics, reviews, settings
    admin/           overview, applications, sellers, customers, shops, products,
                     categories, orders, payments, analytics, notifications,
                     settings, audit logs
  services/          typed API clients per domain
  utils/             formatting, validation helpers
```

The existing design system (`client/src/index.css`) is extended, not replaced.

---

## 8. Environments

| Environment | Database | Purpose |
|---|---|---|
| Local | `guraneza_dev` on Atlas (replica set) | Development, transactions enabled |
| Test | in-memory replica set | Automated tests, isolated |
| Production | Render-managed `MONGO_URI` | Live marketplace |

Deployment: `main` deploys automatically to the existing Render services.
`develop` and feature branches are CI-only.
