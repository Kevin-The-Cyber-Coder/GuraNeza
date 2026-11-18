import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const DEV_SECRET = 'guraneza_dev_secret_change_me';

/** In production the signing key must come from the hosting environment (Render). */
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is missing. Set it in the Render service environment.');
    }
    return DEV_SECRET;
  }
  return secret;
};

const getToken = (req) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.split(' ')[1];
  return null;
};

/** Verifies the JWT and attaches the authenticated user to req. */
export const protect = async (req, res, next) => {
  try {
    const token = getToken(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id).select('-password');

    if (!user) return res.status(401).json({ success: false, message: 'User no longer exists' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'This account has been disabled' });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

/** Restricts a route to administrators only. */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Admin access required' });
};

/** Generates a signed JWT for a user id. */
export const generateToken = (id) =>
  jwt.sign({ id }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
