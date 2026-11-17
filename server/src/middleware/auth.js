import jwt from 'jsonwebtoken';
import User from '../models/User.js';

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'guraneza_super_secret_key_change_me_in_production');
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
  jwt.sign({ id }, process.env.JWT_SECRET || 'guraneza_super_secret_key_change_me_in_production', {
    expiresIn: '30d',
  });
