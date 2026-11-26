# GuraNeza API reference

The GuraNeza API is a REST service built with Express 4 and MongoDB (Mongoose 8).

| Environment | Base URL |
|---|---|
| Local | `http://localhost:5000/api` |
| Production | `https://guraneza-api.onrender.com/api` |

---

## Conventions

### Response shape

Every response contains `success: boolean`.

```json
{
  "success": true,
  "products": [],
  "page": 1,
  "pages": 0,
  "total": 0
}
```

Errors use the same flag with a readable `message`:

```json
{ "success": false, "message": "Invalid email or password" }
```

### Authentication

Protected endpoints expect a bearer token obtained from `POST /auth/login`:

```http
Authorization: Bearer <jwt>
```

Tokens are signed with `JWT_SECRET` and expire after `JWT_EXPIRES_IN` (default `30d`).

### Roles

| Role | Capabilities |
|---|---|
| `customer` | Shop, own orders and profile |
| `seller` | Everything a customer can do, plus own shop and own products |
| `admin` | Full access: catalogue, orders, messages, sellers, analytics |

Authorisation is enforced on the server on every request; hiding UI is never the only control.

### Rate limiting

Auth and public form endpoints (seller applications, invitations, contact) are rate limited. Exceeding a limit returns `429` with `success: false`.

---

## Health

### `GET /health`

```json
{
  "success": true,
  "name": "GuraNeza API",
  "version": "1.0.0",
  "location": "Kigali, Rwanda",
  "time": "2026-11-26T05:11:57.903Z"
}
```

---

## Authentication

### `POST /auth/register` — public

| Field | Type | Required | Rules |
|---|---|---|---|
| `name` | string | ✅ | 2–80 characters |
| `email` | string | ✅ | Valid email, stored lowercase |
| `password` | string | ✅ | 8–128 characters |
| `phone` | string | — | ≤ 30 characters |
| `address` | string | — | ≤ 200 characters |

```json
{
  "success": true,
  "token": "eyJhbGciOi…",
  "user": { "id": "…", "name": "Demo Customer", "email": "demo@guraneza.rw", "role": "customer" }
}
```

| Status | Meaning |
|---|---|
| `201` | Account created |
| `400` | Validation failed |
| `409` | Email already registered |

### `POST /auth/login` — public

```json
{ "email": "admin@guraneza.rw", "password": "Admin@123" }
```

Returns `{ success, message, token, user }`. Inactive or suspended accounts receive `403`.

### `GET /auth/me` — private

Returns the authenticated user without the password hash.

### `PUT /auth/profile` — private

Accepts `name`, `phone`, `address`, and optionally `currentPassword` + `password` to change the password.

---

## Products

### `GET /products` — public

| Query | Type | Default | Description |
|---|---|---|---|
| `keyword` / `search` | string | — | Matches name, description, brand, tags |
| `category` | string | `All` | Category name |
| `brand` | string | — | Exact brand |
| `shop` | ObjectId | — | Products from one shop |
| `minPrice` / `maxPrice` | number | — | RWF range |
| `featured` | `true` | — | Featured only |
| `inStock` | `true` | — | Stock > 0 |
| `status` | string | `published` | Public listing always filters to published |
| `sort` | string | featured/newest | `newest`, `price-asc`, `price-desc`, `popular`, `rating`, `name` |
| `page` | number | `1` | Page number |
| `limit` | number | `12` | Max 60 |

### `GET /products/meta` — public

Distinct brands, categories and the current price range, used to build filters.

### `GET /products/top-selling` — public

Best sellers by `sold`.

### `GET /products/:id` — public

Accepts an ObjectId **or** a slug. Returns the product plus up to four related items. Unpublished products are only visible to their owner or an admin.

### `GET /products/mine` — seller / admin

Products owned by the caller. Supports the same filters and sorting, but never restricts to published status.

### `POST /products` — seller / admin

```json
{
  "name": "Studio Wireless Headphones",
  "description": "…",
  "shortDescription": "…",
  "price": 89000,
  "oldPrice": 115000,
  "category": "Electronics",
  "brand": "SoundCore",
  "stock": 24,
  "status": "published",
  "images": ["https://…/headphones.jpg"]
}
```

Sellers automatically get their own `shop` and `seller` reference; `featured` is admin-only.

### `PUT /products/:id` — seller / admin

Partial update. Sellers may only modify their own products (`403` otherwise). Protected fields (`slug`, `seller`, `shop`, `sold`, `rating`, `numReviews`) cannot be set from the client.

### `DELETE /products/:id` — seller / admin

Deletes the product and records an audit entry.

### `POST /products/:id/images` — seller / admin

`multipart/form-data` with up to six `images` files. Stored through Cloudinary when configured, otherwise locally under `/uploads`.

### `POST /products/:id/images/remove` — seller / admin

```json
{ "imageUrl": "https://…/headphones.jpg" }
```

### `POST /products/bulk-delete` — admin

```json
{ "ids": ["…", "…"] }
```

---

## Orders

Delivery fee is a flat **2,000 RWF** inside Kigali and is computed by the server.

### `POST /orders` — public

Works for guests and signed-in customers.

```json
{
  "items": [{ "product": "6b07bfecb48ad502f470afce", "quantity": 2 }],
  "customer": { "name": "Alice Uwimana", "email": "alice@example.com", "phone": "+250 789 111 222" },
  "shipping": { "address": "KG 11 Ave", "city": "Kigali", "district": "Gasabo", "notes": "Call on arrival" },
  "paymentMethod": "mobile-money"
}
```

`paymentMethod`: `cash-on-delivery` (default), `mobile-money`, `bank-transfer`.

The server re-fetches every price, validates stock, reserves inventory atomically and rolls back on failure. `201` returns `{ success, message, order }`.

### `POST /orders/track` — public

```json
{ "orderNumber": "GN-20261126-1001", "email": "alice@example.com" }
```

Returns the order, its items and status timeline. Works for guest orders.

### `GET /orders/my-orders` — private

Orders belonging to the caller, newest first.

### `GET /orders` — admin

All orders with `count`.

### `GET /orders/:id` — private

Admins can view any order; customers only their own.

### `PUT /orders/:id/status` — admin

```json
{ "status": "Shipped", "note": "Out for delivery" }
```

Allowed: `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`. Each change appends to the timeline; cancelling restores stock.

### `DELETE /orders/:id` — admin

Removes an order record.

---

## Contact messages

### `POST /contacts` — public

```json
{ "name": "Jean Paul", "email": "jeanpaul@example.com", "phone": "+250…", "subject": "Delivery", "message": "Do you deliver outside Kigali?" }
```

### `GET /contacts` — admin

Inbox, newest first.

### `GET /contacts/:id` — admin

Fetch one message (marks it read).

### `PUT /contacts/:id` — admin

```json
{ "status": "Replied", "reply": "Yes, we deliver nationwide." }
```

Statuses: `New`, `Read`, `Replied`, `Closed`.

### `DELETE /contacts/:id` — admin

Delete a message.

---

## Dashboard (admin)

### `GET /dashboard/stats`

```json
{
  "success": true,
  "stats": { "revenue": 173000, "orders": 2, "avgOrder": 86500, "products": 16, "lowStock": 2, "customers": 1, "newMessages": 1 },
  "weekly": [{ "label": "Nov 24", "orders": 1, "revenue": 116000 }]
}
```

### `GET /dashboard/activity`

Recent orders and messages for the activity feed.

---

## Seller onboarding

### `POST /seller-applications` — public

| Field | Required | Rules |
|---|---|---|
| `fullName` | ✅ | 2–120 characters |
| `email` | ✅ | Valid email |
| `phone` | ✅ | 7–30 characters |
| `businessName` | — | ≤ 120 characters |
| `businessLocation` | ✅ | 2–200 characters |
| `businessDescription` | ✅ | 20–2000 characters |
| `businessCategory` | ✅ | 2–80 characters |
| `reason` | ✅ | 20–1000 characters |
| `supportingInfo` | — | ≤ 2000 characters |

Returns `201` with a **reference number**. Duplicate pending applications for the same email return `409`.

### `POST /seller-applications/status` — public

```json
{ "referenceNumber": "SA-8F2K1Q", "email": "you@example.com" }
```

Returns the application status (`pending`, `approved`, `rejected`).

### `GET /seller-applications` — admin

Query: `status` (`all|pending|approved|rejected`), `search`, `page`, `limit`.

### `GET /seller-applications/:id` — admin

Application detail with its invitation metadata.

### `PATCH /seller-applications/:id/approve` — admin

Approves the application, creates a single-use invitation and emails the activation link (when Resend is configured).

### `PATCH /seller-applications/:id/reject` — admin

```json
{ "reason": "Incomplete business information" }
```

### `POST /seller-applications/:id/resend-invitation` — admin

Issues a fresh token and expiry, invalidating the previous link.

### `GET /seller-invitations/validate?token=…` — public

Validates a token without consuming it. Expired or used tokens return `400`.

### `POST /seller-invitations/activate` — public

```json
{ "token": "…", "password": "StrongPass123", "confirmPassword": "StrongPass123" }
```

Creates (or promotes) the seller account, marks the invitation used and returns a session.

---

## Seller shop

All routes require a seller token.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/shops/me` | Own shop (created on first access) |
| `PUT` | `/shops/me` | Update `name`, `description`, `phone`, `email`, `location` |
| `POST` | `/shops/me/logo` | Upload shop logo (`multipart/form-data`, field `logo`) |
| `POST` | `/shops/me/cover` | Upload cover image (field `cover`) |

---

## Status codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Resource created |
| `400` | Validation error or business rule violation |
| `401` | Missing or invalid token |
| `403` | Authenticated but not allowed |
| `404` | Resource not found |
| `409` | Conflict (duplicate email, pending application, used token) |
| `429` | Rate limit exceeded |
| `500` | Unexpected server error |

---

## Testing with Postman

1. Import `postman/GuraNeza.postman_collection.json` and `postman/GuraNeza.postman_environment.json`.
2. Select the **GuraNeza Live** environment (or point `baseUrl` at your local API).
3. Run the collection — requests include `pm.test()` assertions, and `postman/api-test-report.html` shows a previous live run.
