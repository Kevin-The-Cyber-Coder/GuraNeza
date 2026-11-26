import User from '../models/User.js';
import Shop from '../models/Shop.js';
import AuditLog from '../models/AuditLog.js';
import { asyncHandler, httpError } from '../middleware/error.js';
import { recordAudit } from '../services/audit.js';
import { normalizeRole, ROLES } from '../config/rbac.js';

const safeRegex = (v) => new RegExp(String(v).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

export const listUsers = asyncHandler(async (req, res) => {
  const { role, search, status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = normalizeRole(role);
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
