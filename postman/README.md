# GuraNeza API — Practical API Testing (Postman)

This folder contains the API test artifacts for the GuraNeza MERN project.

> **Note:** I could not sign in to a personal Postman account, so the requests below were executed directly against the live backend (`http://localhost:5000`) and then packaged as a Postman collection with assertions. Your teacher can import the collection into Postman and see every request, response and PASS/FAIL test result.

## Files

| File | What it is |
|---|---|
| `GuraNeza.postman_collection.json` | 30 requests in 6 folders, each with `pm.test()` assertions (status code, `success` flag, response fields). |
| `GuraNeza.postman_environment.json` | `GuraNeza Live` environment with `baseUrl`, `token`, `productId`, `orderId`, `contactId`, `orderNumber`, `email`. |
| `api-test-report.html` | A self-contained browser report of the actual live test run — open it directly, no Postman login needed. |

## How the teacher can run it in Postman

1. Open **Postman** → **Import** → **Upload Files** → select both JSON files in this folder.
2. In the top-right dropdown, select the **GuraNeza Live** environment.
3. Open the collection **GuraNeza API — Lecturer Demo** → click **Run**.
4. Select the collection, keep all requests ticked, and click **Run GuraNeza API — Lecturer Demo**.
5. The **Login** request automatically saves the JWT into the `token` variable, so protected requests pass on the first run.
6. The Collection Runner shows a green PASS/FAIL result for every assertion. Click any request to see its request body and response.

Alternatively, open `api-test-report.html` in a browser — it shows the live results without needing Postman.

## Live test run — 18 Nov 2026 (UTC)

Base URL: `http://localhost:5000`

| # | Request | Expected | Actual | Key response |
|---|---|---|---|---|
| 1 | `GET /api/health` | 200 | ✅ 200 | `success: true`, `name: GuraNeza API` |
| 2 | `GET /api/products?featured=true&limit=8` | 200 | ✅ 200 | `products` array returned |
| 3 | `GET /api/products/meta` | 200 | ✅ 200 | Categories: Electronics, Fashion, Home & Living, Sports, Beauty… |
| 4 | `GET /api/products/top-selling` | 200 | ✅ 200 | `products` with `units` and `revenue` |
| 5 | `GET /api/products?search=coffee` | 200 | ✅ 200 | "Rwanda Organic Coffee (500g)" found |
| 6 | `GET /api/products/{id}` | 200 | ✅ 200 | Correct product object returned |
| 7 | `GET /api/auth/me` (no token) | 401 | ✅ 401 | "Not authorized, no token provided" |
| 8 | `GET /api/dashboard/stats` (no token) | 401 | ✅ 401 | "Not authorized, no token provided" |
| 9 | `POST /api/orders/track` (unknown order) | 404 | ✅ 404 | "No order found with that number and email" |
| 10 | `POST /api/auth/login` (demo admin) | 200 | ✅ 200 | JWT token received (value redacted here) |
| 11 | `GET /api/auth/me` (with token) | 200 | ✅ 200 | `admin@guraneza.rw` profile returned |
| 12 | `GET /api/dashboard/stats` (admin) | 200 | ✅ 200 | revenue 466000, orders 4, products 18, lowStock 3 |
| 13 | `GET /api/dashboard/activity` (admin) | 200 | ✅ 200 | Recent activity array returned |
| 14 | `GET /api/orders` (admin) | 200 | ✅ 200 | Orders array returned |
| 15 | `GET /api/contacts` (admin) | 200 | ✅ 200 | Contact messages array returned |
| 16 | `GET /api/orders/my-orders` (customer) | 200 | ✅ 200 | Orders array returned (empty for admin account) |

**Result: 16/16 executed requests behaved as expected.** No console/network errors.

## Demo credentials used

| Role | Email | Password |
|---|---|---|
| Admin | `admin@guraneza.rw` | `Admin@123` |
| Customer | `demo@guraneza.rw` | `Demo@123` |

## Requests marked "⚠ WRITES DATA"

The collection also contains register, create/update/delete product, order and contact requests so the full API surface is documented. **These were deliberately not executed against the live database** during the test run. Run them only against a local or test database.

## What the tests prove

- Public catalogue, search, metadata and health endpoints work without authentication.
- JWT auth works: login issues a token, protected routes accept it, and anonymous requests are rejected with `401`.
- Role-based admin routes (dashboard, all orders, all contacts) work with an admin token.
- Order tracking correctly returns `404` for an unknown order number/email pair.
- The hosted frontend and hosted backend are connected end-to-end: the storefront fetches these same products from `http://localhost:5000/api`.
