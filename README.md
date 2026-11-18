# 🛒 GuraNeza

> **GuraNeza** — shop smart in Kigali, Rwanda. A complete, professional MERN e-commerce platform with a customer storefront and a powerful admin console.

GuraNeza ("buy well" in Kinyarwanda) is a full-stack online shop built for a modern Rwandan retail experience. Customers can browse as guests, create accounts, place orders, and track their daily shopping. Administrators log in to manage products, receive orders and website messages, and follow live sales analytics.

---

## ✨ Features

### Customer storefront
- Beautiful, responsive landing page with categories, featured products and testimonials
- Shop with search, category filters, price filters, sorting and pagination
- Product detail pages with gallery, stock, related products and tabs
- Guest or registered-user shopping with a persistent cart (localStorage)
- Checkout with delivery details and Cash on Delivery / Mobile Money / Bank Transfer
- Order confirmation and **live order tracking** by order number + email
- Registered customers get a personal "My Orders" dashboard with progress timelines
- Contact form wired directly to the admin inbox
- Contact info, FAQ, newsletter and responsive design throughout

### Admin console (`/admin`)
- Secure JWT login with role-based access (admin only)
- Dashboard with revenue, orders, products, customers and message metrics
- 7-day / 30-day revenue bar charts and order-status breakdown
- Product management — create, edit, delete, feature, image URLs, stock control
- Order management — filter by status, view details, update status with timeline, delete
- Message management — read, reply, mark as read/replied/closed, delete
- Recent activity feed and quick actions

### Technical
- **MongoDB** with Mongoose models (User, Product, Order, Contact)
- **Express.js + Node.js** REST API with JWT auth, bcrypt hashing and centralised errors
- **React 18 + Vite** frontend with React Router, Context API and a custom design system
- Server-side price verification and stock management on checkout/cancellation
- Seed script with a demo admin, customer, 16 realistic products, orders and messages
- Every change committed locally with Git for a clean, push-ready history

---

## 📁 Project structure

```
GuraNeza/
├── server/                 # Express REST API
│   └── src/
│       ├── config/         # MongoDB connection
│       ├── controllers/    # Auth, products, orders, contacts, dashboard
│       ├── middleware/     # JWT auth, admin guard, error handler
│       ├── models/         # Mongoose schemas
│       ├── routes/         # API routes
│       ├── utils/seed.js   # Demo data generator
│       ├── app.js
│       └── server.js
├── client/                 # React storefront + admin UI
│   └── src/
│       ├── components/     # Header, Footer, ProductCard, guards
│       ├── context/        # Auth, Cart, Toast providers
│       ├── pages/          # Storefront pages
│       │   └── admin/      # Admin console pages
│       ├── services/api.js # Typed API wrapper
│       ├── utils/helpers.js
│       ├── App.jsx
│       └── index.css       # Complete design system
├── package.json            # Root scripts (run both apps)
└── README.md
```

---

## 🚀 Getting started

### Prerequisites
- **Node.js 18+** and npm
- **MongoDB** — a local instance or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- **Git**

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Configure the backend
```bash
copy server\.env.example server\.env
```
Edit `server/.env` and set your `MONGO_URI`. For Atlas:
```
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/guraneza
```
Change `JWT_SECRET` to a long random string in production.

### 3. Seed the database (creates admin + demo data)
```bash
npm run seed
```

### 4. Run both apps
```bash
npm run dev
```
- Storefront: <http://localhost:5173>
- API: <http://localhost:5000/api/health>

### Demo accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@guraneza.rw` | `Admin@123` |
| Customer | `demo@guraneza.rw` | `Demo@123` |

Signing in as admin redirects to `/admin`.

---

## 🔌 API overview

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Create customer account |
| POST | `/api/auth/login` | Public | Login (returns JWT) |
| GET | `/api/auth/me` | Private | Current user |
| GET | `/api/products` | Public | Search / filter / paginate products |
| GET | `/api/products/:id` | Public | Product + related items |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| POST | `/api/orders` | Public | Place order (guest or user) |
| POST | `/api/orders/track` | Public | Track by order number + email |
| GET | `/api/orders/my-orders` | Private | Current user's orders |
| GET | `/api/orders` | Admin | All orders |
| PUT | `/api/orders/:id/status` | Admin | Update order status |
| POST | `/api/contacts` | Public | Send website message |
| GET | `/api/contacts` | Admin | Inbox |
| PUT | `/api/contacts/:id` | Admin | Reply / update status |
| GET | `/api/dashboard/stats` | Admin | Analytics metrics |

All protected routes expect `Authorization: Bearer <token>`.

---

## 🌐 Deployment (Render)

The frontend is hosted as a Render Static Site at <https://guraneza-ja1a.onrender.com/>.

1. In Render, create a **Blueprint** from this repository. It will create the `guraneza-api` web service using `render.yaml`.
2. When prompted, fill in `MONGO_URI`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`. `JWT_SECRET` is generated automatically and must never be committed.
3. After the API deploys, copy its `onrender.com` URL and set this environment variable on the **frontend Static Site**:
   ```
   VITE_API_URL=https://<your-backend-service>.onrender.com/api
   ```
4. Redeploy the frontend. The API already allows the frontend origin through CORS via `CLIENT_URL`.

JWT tokens expire using UTC time (`JWT_EXPIRES_IN`, default `30d`) and are verified with the server-side secret from the environment. `client/public/_redirects` makes React Router deep links work on the static site.

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
