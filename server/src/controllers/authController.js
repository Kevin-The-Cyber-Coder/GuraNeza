import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import { validatePasswordStrength } from '../utils/password.js';

const sanitize = (user) => ({
  _id: user._id,
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  address: user.address || '',
  role: user.role,
  avatar: user.avatar || '',
  isActive: user.isActive,
  mustChangePassword: !!user.mustChangePassword,
  createdAt: user.createdAt,
});

const validateRegistration = ({ name, email, password }) => {
  const errors = [];
  if (!name || name.trim().length < 2) errors.push('Please provide a valid name');
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push('Please provide a valid email');
  errors.push(...validatePasswordStrength(password));
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
    role: 'customer', // sellers are created only through the approval workflow
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
    const canUseTemporaryPassword = user.role === 'seller' && user.mustChangePassword;
    if (!canUseTemporaryPassword) {
      return res.status(403).json({
        success: false,
        message:
          user.role === 'seller'
            ? 'Your seller account is not active yet. Please use the activation link or temporary credentials provided by GuraNeza.'
            : 'This account has been disabled',
      });
    }
    user.isActive = true;
    await user.save();
  }

  await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

  res.json({
    success: true,
    message: user.mustChangePassword ? 'Please change your temporary password to continue.' : `Welcome back, ${user.name}!`,
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
    const passwordErrors = validatePasswordStrength(password);
    if (passwordErrors.length) {
      return res.status(400).json({ success: false, message: passwordErrors.join('. ') });
    }
    user.password = password;
    user.mustChangePassword = false;
  }

  await user.save();
  res.json({ success: true, message: 'Profile updated successfully', user: sanitize(user) });
});
