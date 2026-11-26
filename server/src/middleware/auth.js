import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import env from '../config/env.js';
import { ROLES, normalizeRole, hasRole, can } from '../config/rbac.js';

const getToken = (req) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
};

const isSuspended = (user) =>
  user?.accountStatus === 'suspended' || user?.accountStatus === 'disabled' || user?.isActive === false;

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

    if (isSuspended(user)) {
      const role = normalizeRole(user.role);
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_SUSPENDED',
        message:
          role === ROLES.SELLER
            ? 'Your seller account is not active. Please contact support or use your activation flow.'
            : 'This account has been suspended or disabled.',
      });
    }

    req.user = user;
    req.userRole = normalizeRole(user.role);

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
 * Restricts a route to one or more roles. Accepts canonical and legacy role names.
 * Always use this on the server; client-side guards are presentation only.
 */
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    if (!hasRole(req.user, ...roles)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }
    return next();
  };

export const requirePermission =
  (...permissions) =>
  (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });
    const ok = permissions.flat().some((p) => can(req.user, p));
    if (!ok) {
      return res.status(403).json({ success: false, message: 'You do not have permission to perform this action' });
    }
    return next();
  };

export const adminOnly = authorize(ROLES.SUPER_ADMIN, 'admin');
export const superAdminOnly = authorize(ROLES.SUPER_ADMIN, 'admin');
export const sellerOnly = authorize(ROLES.SELLER, 'seller');
export const customerOnly = authorize(ROLES.CUSTOMER, 'customer');

/** Allows super admins and the owner of a resource; denies everyone else. */
export const ownerOrAdmin = (getOwnerId) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
  if (hasRole(req.user, ROLES.SUPER_ADMIN)) return next();

  const ownerId = typeof getOwnerId === 'function' ? getOwnerId(req) : getOwnerId;
  if (ownerId && String(ownerId) === String(req.user._id)) return next();

  return res.status(403).json({
    success: false,
    message: 'You are not allowed to access this resource',
  });
};

export const requireOwnership = ({ getOwnerId, allowRoles = [ROLES.SUPER_ADMIN], resource = 'resource' }) =>
  async (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });
    if (hasRole(req.user, ...allowRoles)) return next();
    try {
      const ownerId = await getOwnerId(req);
      if (ownerId && String(ownerId) === String(req.user._id)) return next();
    } catch {
      // fall through to forbidden
    }
    return res.status(403).json({ success: false, message: `You are not allowed to access this ${resource}` });
  };

export const requireActiveShop = (getShop) => async (req, res, next) => {
  try {
    const shop = await getShop(req);
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
    if (shop.status && !['active', 'approved'].includes(shop.status)) {
      if (!hasRole(req.user, ROLES.SUPER_ADMIN)) {
        return res.status(403).json({ success: false, message: 'This shop is not currently active' });
      }
    }
    req.shop = shop;
    return next();
  } catch (error) {
    return next(error);
  }
};

/** Generates a signed JWT for a user id. */
export const generateToken = (id) =>
  jwt.sign({ id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

export { ROLES, normalizeRole, hasRole, can };
