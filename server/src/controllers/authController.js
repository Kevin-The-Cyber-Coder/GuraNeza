import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const sanitize = (user) => ({
  _id: user._id,
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  address: user.address || '',
  role: user.role,
  avatar: user.avatar || '',
});

const validateRegistration = ({ name, email, password }) => {
  const errors = [];
  if (!name || name.trim().length < 2) errors.push('Please provide a valid name');
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push('Please provide a valid email');
  if (!password || password.length < 6) errors.push('Password must be at least 6 characters');
  return errors;
};

// @desc    Register a new customer
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  const errors = validateRegistration(req.body);
  if (errors.length) return res.status(400).json({ success: false, message: errors.join('. ') });

  const exists = await User.findOne({ email: email.toLowerCase().trim() });
  if (exists) return res.status(409).json({ success: false, message: 'An account with this email already exists' });

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    phone: phone || '',
    address: address || '',
    role: 'user', // admins are created only by the seed script / existing admins
  });

  await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

  res.status(201).json({
    success: true,
    message: `Welcome to GuraNeza, ${user.name}!`,
    token: generateToken(user._id),
    user: sanitize(user),
  });
});

// @desc    Log in a user or admin
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide both email and password' });
  }

  // password is select:false on the model, so explicitly request it here.
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'This account has been disabled' });
  }

  await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

  res.json({
    success: true,
    message: `Welcome back, ${user.name}!`,
    token: generateToken(user._id),
    user: sanitize(user),
  });
});

// @desc    Get the authenticated user's profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: sanitize(req.user) });
});

// @desc    Update the authenticated user's profile (optionally change password)
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address, password, currentPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (name) user.name = name.trim();
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;

  if (password) {
    if (!currentPassword || !(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }
    user.password = password;
  }

  await user.save();
  res.json({ success: true, message: 'Profile updated successfully', user: sanitize(user) });
});
