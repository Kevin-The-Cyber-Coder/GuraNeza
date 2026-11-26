import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const USER_ROLES = ['CUSTOMER', 'SELLER', 'SUPER_ADMIN', 'customer', 'seller', 'admin'];

export const LEGACY_ROLE_MAP = {
  admin: 'SUPER_ADMIN',
  super_admin: 'SUPER_ADMIN',
  customer: 'CUSTOMER',
  user: 'CUSTOMER',
  seller: 'SELLER',
};

export const normalizeRole = (role) => {
  if (!role) return 'CUSTOMER';
  const raw = String(role).trim();
  return LEGACY_ROLE_MAP[raw] || LEGACY_ROLE_MAP[raw.toLowerCase()] || raw.toUpperCase();
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: {
        values: USER_ROLES,
        message: '{VALUE} is not a valid role',
      },
      default: 'CUSTOMER',
      index: true,
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'pending', 'disabled'],
      default: 'active',
      index: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    emailVerifiedAt: {
      type: Date,
    },
    passwordChangedAt: {
      type: Date,
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, isActive: 1 });

userSchema.pre('save', async function (next) {
  if (this.isModified('role')) {
    this.role = normalizeRole(this.role);
  }
  // Keep legacy isActive in sync with accountStatus.
  if (this.isModified('accountStatus')) {
    this.isActive = this.accountStatus === 'active' || this.accountStatus === 'pending';
  }
  if (this.isModified('isActive') && !this.isModified('accountStatus')) {
    this.accountStatus = this.isActive ? 'active' : 'disabled';
  }
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordChangedAt = new Date();
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.normalizedRole = function () {
  return normalizeRole(this.role);
};

userSchema.methods.isSeller = function () {
  return this.normalizedRole() === 'SELLER';
};

userSchema.methods.isSuperAdmin = function () {
  return this.normalizedRole() === 'SUPER_ADMIN';
};

userSchema.methods.isAdmin = function () {
  return this.isSuperAdmin();
};

userSchema.methods.isCustomer = function () {
  return this.normalizedRole() === 'CUSTOMER';
};

userSchema.methods.isSuspended = function () {
  return this.accountStatus === 'suspended' || this.accountStatus === 'disabled' || this.isActive === false;
};

// Never expose the password hash or internal bookkeeping in JSON responses.
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.passwordChangedAt;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);
export default User;
