# Screenshots

This directory is reserved for genuine application screenshots used in the main `README.md`.

## Capture policy

- Capture **real** screenshots from a running GuraNeza instance only.
- Do not use mockups, stock images, or fabricated UI.
- Use descriptive filenames:
  - `homepage.png`
  - `shop.png`
  - `product-detail.png`
  - `cart.png`
  - `checkout.png`
  - `login.png`
  - `register.png`
  - `admin-dashboard.png`
  - `seller-dashboard.png`
  - `mobile-home.png`

## How to capture locally

1. Install dependencies: `npm run install:all`
2. Configure `server/.env` from `server/.env.example` and set a valid `MONGO_URI`.
3. Seed demo data: `npm run seed`
4. Start the app: `npm run dev`
5. Open `http://localhost:5173` and capture pages with your browser/device screenshot tool.

## Current environment limitation

In this automation run, the browser screenshot tool required a visible desktop window and could not capture headless screenshots. No fake screenshots were added. Capture should be performed from a local desktop/browser session or CI with a headed browser.
