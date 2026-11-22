import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { isTest } from '../config/env.js';

/** Security headers. CSP is managed by the hosting layer for the SPA build. */
export const securityHeaders = helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

const tooManyRequests = (_req, res) =>
  res.status(429).json({
    success: false,
    message: 'Too many requests. Please wait a moment and try again.',
  });

const base = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: tooManyRequests,
  skip: () => isTest,
};

/** Broad protection for the whole API. */
export const apiLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 600,
});

/** Tighter limits for authentication endpoints. */
export const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 30,
});

/** Seller applications and other write-heavy public forms. */
export const formLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 10,
});
