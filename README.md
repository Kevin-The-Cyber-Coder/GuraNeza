# 🛒 GuraNeza

> **GuraNeza** — shop smart in Kigali, Rwanda. A complete, professional MERN e-commerce platform with a customer storefront and a powerful admin console.

GuraNeza ("buy well" in Kinyarwanda) is a full-stack online shop built for a modern Rwandan retail experience. Customers can browse as guests, create accounts, place orders, and track their daily shopping. Administrators log in to manage products, receive orders and website messages, and follow live sales analytics.

---

## Local Development

The project is configured for localhost by default.

- **API:** http://localhost:5000/api
- **Client:** http://localhost:5173
- **Client build env:** client/.env.production sets VITE_API_URL=http://localhost:5000/api
- **Server CORS:** allows localhost origins by default (CLIENT_URL can override/add origins).

Start both services:

`ash
# Terminal 1
cd server
npm install
npm run dev

# Terminal 2
cd client
npm install
npm run dev
`

JWT tokens expire using UTC time (JWT_EXPIRES_IN, default 30d) and are verified with the server-side secret from the environment.

## 💾 Git workflow

```bash
git log --oneline        # review the history
git status               # check working tree
git push origin main     # publish the main branch
```

---

## 🇷🇼 Built for Kigali

GuraNeza is designed around local realities: prices in RWF, Cash on Delivery and Mobile Money, Kigali delivery zones, and products from Rwandan brands such as Umurage Farm, Imanzi Home and Murage Beauty.

© 2026 GuraNeza. All rights reserved.
