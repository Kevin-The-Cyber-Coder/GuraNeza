import User from '../models/User.js';
import Shop from '../models/Shop.js';
import AuditLog from '../models/AuditLog.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { asyncHandler, httpError } from '../middleware/error.js';
import { recordAudit } from '../services/audit.js';
import { normalizeRole, ROLES } from '../config/rbac.js';
import env from '../config/env.js';

const safeRegex = (v) => new RegExp(String(v).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

export const listUsers = asyncHandler(async (req, res) => {
  const { role, search, status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) {
    const normalized = normalizeRole(role);
    const legacy = { SUPER_ADMIN: ['SUPER_ADMIN', 'admin'], SELLER: ['SELLER', 'seller'], CUSTOMER: ['CUSTOMER', 'customer', 'user'] }[normalized] || [normalized];
    filter.role = { $in: legacy };
  }
  if (status) filter.accountStatus = status;
  if (search) {
    const rx = safeRegex(search);
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  const skip = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));
  const lim = Math.min(100, Math.max(1, Number(limit)));
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim).select('-password').lean(),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / lim) });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['active', 'suspended', 'pending', 'disabled'];
  if (!allowed.includes(status)) throw httpError(400, 'Invalid account status');
  const user = await User.findById(req.params.id);
  if (!user) throw httpError(404, 'User not found');
  if (String(user._id) === String(req.user._id)) throw httpError(400, 'You cannot change your own account status');
  if (normalizeRole(user.role) === ROLES.SUPER_ADMIN) throw httpError(403, 'Super Admin accounts cannot be modified through this endpoint');

  const before = user.accountStatus;
  user.accountStatus = status;
  user.isActive = status === 'active' || status === 'pending';
  await user.save();

  await recordAudit({
    req,
    action: 'USER_STATUS_UPDATED',
    entityType: 'User',
    entityId: user._id,
    metadata: { before, after: status, role: normalizeRole(user.role), email: user.email },
  });

  res.json({ success: true, user: user.toJSON() });
});

export const listShops = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    const rx = safeRegex(search);
    filter.$or = [{ name: rx }, { email: rx }, { location: rx }, { slug: rx }];
  }
  const skip = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));
  const lim = Math.min(100, Math.max(1, Number(limit)));
  const [shops, total] = await Promise.all([
    Shop.find(filter).populate('owner', 'name email role accountStatus').sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
    Shop.countDocuments(filter),
  ]);
  res.json({ success: true, shops, total, page: Number(page), pages: Math.ceil(total / lim) });
});

export const updateShopStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['active', 'suspended', 'inactive'];
  if (!allowed.includes(status)) throw httpError(400, 'Invalid shop status');
  const shop = await Shop.findById(req.params.id);
  if (!shop) throw httpError(404, 'Shop not found');
  const before = shop.status;
  shop.status = status;
  await shop.save();

  await recordAudit({
    req,
    action: 'SHOP_STATUS_UPDATED',
    entityType: 'Shop',
    entityId: shop._id,
    metadata: { before, after: status, shopName: shop.name, owner: shop.owner },
  });

  res.json({ success: true, shop });
});

export const listAuditLogs = asyncHandler(async (req, res) => {
  const { action, entityType, outcome, page = 1, limit = 25 } = req.query;
  const filter = {};
  if (action) filter.action = safeRegex(action);
  if (entityType) filter.entityType = safeRegex(entityType);
  if (outcome) filter.outcome = outcome;
  const skip = (Math.max(1, Number(page)) - 1) * Math.min(100, Number(limit));
  const lim = Math.min(100, Math.max(1, Number(limit)));
  const [logs, total] = await Promise.all([
    AuditLog.find(filter).populate('actor', 'name email role').sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
    AuditLog.countDocuments(filter),
  ]);
  res.json({ success: true, logs, total, page: Number(page), pages: Math.ceil(total / lim) });
});

export const getSecurityOverview = asyncHandler(async (_req, res) => {
  const [deniedCount, failureCount, recentEvents, suspendedUsers, suspendedShops] = await Promise.all([
    AuditLog.countDocuments({ outcome: 'denied' }),
    AuditLog.countDocuments({ outcome: 'failure' }),
    AuditLog.find({ outcome: { $in: ['denied', 'failure'] } })
      .populate('actor', 'name email role')
      .sort({ createdAt: -1 })
      .limit(25)
      .lean(),
    User.countDocuments({ accountStatus: { $in: ['suspended', 'disabled'] } }),
    Shop.countDocuments({ status: { $in: ['suspended', 'inactive'] } }),
  ]);
  res.json({
    success: true,
    stats: { deniedCount, failureCount, suspendedUsers, suspendedShops },
    recentEvents,
  });
});

export const getCategoriesOverview = asyncHandler(async (_req, res) => {
  const schemaCategories = Product.schema.path('category')?.enumValues || [];
  const counts = await Product.aggregate([{ $group: { _id: '$category', products: { $sum: 1 } } }]);
  const countMap = new Map(counts.map((c) => [c._id, c.products]));
  const categories = schemaCategories.map((name) => ({ name, products: countMap.get(name) || 0 }));
  res.json({ success: true, categories });
});

export const getPlatformSettings = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    settings: {
      nodeEnv: env.NODE_ENV,
      clientUrl: env.CLIENT_URL,
      appUrl: env.APP_URL,
      jwtExpiresIn: env.JWT_EXPIRES_IN,
      sellerInviteTtlHours: env.SELLER_INVITE_TTL_HOURS,
      uploadMaxMb: env.UPLOAD_MAX_MB,
      emailConfigured: !!env.RESEND_API_KEY,
      cloudinaryConfigured: !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY),
      corsOriginsConfigured: true,
    },
  });
});

export const getPlatformAnalytics = asyncHandler(async (_req, res) => {
  const [usersByRole, shopsByStatus, productsByStatus, ordersByStatus, revenue] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Shop.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Product.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$pricing.total' } } }]),
    Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, revenue: { $sum: '$pricing.total' }, orders: { $sum: 1 } } }]),
  ]);
  res.json({
    success: true,
    analytics: {
      usersByRole,
      shopsByStatus,
      productsByStatus,
      ordersByStatus,
      revenue: revenue[0]?.revenue || 0,
      orders: revenue[0]?.orders || 0,
    },
  });
});
