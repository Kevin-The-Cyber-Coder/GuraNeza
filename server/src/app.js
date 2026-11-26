import express from 'express';
import cors from 'cors';
import path from 'node:path';

import env from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import sellerApplicationRoutes from './routes/sellerApplicationRoutes.js';
import sellerInvitationRoutes from './routes/sellerInvitationRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import errorHandler from './middleware/error.js';
import { apiLimiter, securityHeaders } from './middleware/security.js';

const app = express();

// Render runs the API behind a proxy; this lets Express report the real scheme/host.
app.set('trust proxy', 1);

const defaultOrigins = [
  'http://localhost:5173',
  'https://guraneza-ja1a.onrender.com',
];
const configuredOrigins = env.CLIENT_URL.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
if (env.APP_URL) configuredOrigins.push(env.APP_URL);
const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])];
const isLocalOrigin = (origin) => /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

// Middleware
app.use(securityHeaders);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin) || isLocalOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));
app.use('/api', apiLimiter);

// API health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    name: 'GuraNeza API',
    version: '1.0.0',
    location: 'Kigali, Rwanda',
    time: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/seller-applications', sellerApplicationRoutes);
app.use('/api/seller-invitations', sellerInvitationRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Serve built frontend in production if present
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) res.status(404).json({ success: false, message: 'Resource not found' });
  });
});

app.use(errorHandler);

export default app;
