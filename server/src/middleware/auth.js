import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import env from '../config/env.js';

const getToken = (req) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
};

/** Verifies the JWT and attaches the authenticated user to req.user. */
export const protect = async (req, res, next) => {
  try {
    const token = getToken(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) return res.status(401).json({ success: false, message: 'User no longer exists' });
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          user.role === 'seller'
            ? 'Your seller account is not active yet. Please use your activation link.'
            : 'This account has been disabled',
      });
    }

    req.user = user;
    if (user.mustChangePassword) {
      const allowed = ['/api/auth/profile', '/api/auth/me', '/api/auth/logout'];
      const path = (req.originalUrl || '').split('?')[0];
      if (!allowed.includes(path)) {
        return res.status(403).json({
          success: false,
          code: 'PASSWORD_CHANGE_REQUIRED',
          message: 'You must change your temporary password before continuing.',
        });
      }
    }
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired, please sign in again' });
    }
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

/**
 * Restricts a route to one or more roles.
 * Always use this on the server; client-side guards are presentation only.
 *
 * @example router.get('/admin', protect, authorize('admin'), handler)
 */
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }
    return next();
  };

export const adminOnly = authorize('admin');
export const sellerOnly = authorize('seller');
export const customerOnly = authorize('customer');

/** Allows admins and the owner of a resource; denies everyone else. */
export const ownerOrAdmin = (getOwnerId) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
  if (req.user.role === 'admin') return next();

  const ownerId = typeof getOwnerId === 'function' ? getOwnerId(req) : getOwnerId;
  if (ownerId && String(ownerId) === String(req.user._id)) return next();

  return res.status(403).json({
    success: false,
    message: 'You are not allowed to access this resource',
  });
};

/** Generates a signed JWT for a user id. */
export const generateToken = (id) =>
  jwt.sign({ id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
