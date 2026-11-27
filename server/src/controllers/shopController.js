import Shop from '../models/Shop.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { asyncHandler } from '../middleware/error.js';
import { ensureShopForSeller } from '../services/shops.js';
import { saveImage, removeImage } from '../services/storage.js';
import { slugify, httpError } from '../utils/text.js';
import { recordAudit } from '../services/audit.js';

const uniqueSlug = async (base, excludeId) => {
  const clean = slugify(base) || 'shop';
  let slug = clean;
  let i = 1;
  while (await Shop.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    i += 1;
    slug = `${clean}-${i}`;
  }
  return slug;
};

export const getMyShop = asyncHandler(async (req, res) => {
  const shop = await ensureShopForSeller(req.user);
  res.json({ success: true, shop });
});

export const updateMyShop = asyncHandler(async (req, res) => {
  const shop = await ensureShopForSeller(req.user);
  const { name, description, phone, email, location } = req.body;

  if (name && name !== shop.name) {
    shop.name = name;
    shop.slug = await uniqueSlug(name, shop._id);
  }
  shop.description = description ?? shop.description;
  shop.phone = phone ?? shop.phone;
  shop.email = email ?? shop.email;
  shop.location = location ?? shop.location;
  await shop.save();

  await recordAudit({
    req,
    action: 'shop.updated',
    entityType: 'Shop',
    entityId: shop._id,
    metadata: { sellerId: req.user._id },
  });

  res.json({ success: true, message: 'Shop updated successfully', shop });
});

const uploadShopImage = async (req, res, field) => {
  if (!req.file) throw httpError(400, 'Please select an image to upload');
  const shop = await ensureShopForSeller(req.user);
  const saved = await saveImage(req.file, `shops/${shop._id}`);

  const previous = field === 'logo' ? shop.logo : shop.coverImage;
  if (previous) await removeImage(previous);

  if (field === 'logo') shop.logo = saved.url;
  else shop.coverImage = saved.url;
  await shop.save();

  await recordAudit({
    req,
    action: `shop.${field}_updated`,
    entityType: 'Shop',
    entityId: shop._id,
    metadata: { sellerId: req.user._id },
  });

  res.json({ success: true, message: 'Image uploaded successfully', shop, image: saved });
};

export const uploadLogo = asyncHandler(async (req, res) => uploadShopImage(req, res, 'logo'));
export const uploadCover = asyncHandler(async (req, res) => uploadShopImage(req, res, 'coverImage'));

export const getMyShopAnalytics = asyncHandler(async (req, res) => {
  const shop = await ensureShopForSeller(req.user);
  const sellerProducts = await Product.find({ seller: req.user._id }).select('_id name stock price status sold category').lean();
  const ids = new Set(sellerProducts.map((p) => String(p._id)));
  const orders = await Order.find({ 'items.product': { $in: [...ids] } }).select('status createdAt pricing.total items customer').lean();

  let revenue = 0;
  let itemCount = 0;
  const customers = new Set();
  const byStatus = {};
  for (const o of orders) {
    const mine = o.items.filter((it) => ids.has(String(it.product)));
    if (mine.length === 0) continue;
    if (o.status !== 'Cancelled') {
      revenue += mine.reduce((s, it) => s + it.price * it.quantity, 0);
      itemCount += mine.reduce((s, it) => s + it.quantity, 0);
    }
    if (o.customer?.email) customers.add(o.customer.email.toLowerCase());
    byStatus[o.status] = (byStatus[o.status] || 0) + 1;
  }

  res.json({
    success: true,
    analytics: {
      shop: { id: shop._id, name: shop.name, status: shop.status },
      products: {
        total: sellerProducts.length,
        published: sellerProducts.filter((p) => p.status === 'published').length,
        draft: sellerProducts.filter((p) => p.status === 'draft').length,
        lowStock: sellerProducts.filter((p) => p.stock < 10).length,
      },
      orders: { total: orders.filter((o) => o.items.some((it) => ids.has(String(it.product)))).length, byStatus },
      revenue,
      itemsSold: itemCount,
      customers: customers.size,
      topProducts: [...sellerProducts].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 5).map((p) => ({ _id: p._id, name: p.name, sold: p.sold || 0, stock: p.stock, price: p.price })),
    },
  });
});

export const getMyShopCustomers = asyncHandler(async (req, res) => {
  const sellerProducts = await Product.find({ seller: req.user._id }).select('_id').lean();
  const ids = new Set(sellerProducts.map((p) => String(p._id)));
  const orders = await Order.find({ 'items.product': { $in: [...ids] } }).select('customer createdAt status items').sort({ createdAt: -1 }).lean();

  const map = new Map();
  for (const o of orders) {
    const mine = o.items.filter((it) => ids.has(String(it.product)));
    if (mine.length === 0) continue;
    const email = (o.customer?.email || '').toLowerCase();
    if (!email) continue;
    const prev = map.get(email) || { name: o.customer?.name, email: o.customer?.email, phone: o.customer?.phone, orders: 0, spend: 0, lastOrderAt: o.createdAt };
    prev.orders += 1;
    if (o.status !== 'Cancelled') prev.spend += mine.reduce((s, it) => s + it.price * it.quantity, 0);
    if (new Date(o.createdAt) > new Date(prev.lastOrderAt)) prev.lastOrderAt = o.createdAt;
    map.set(email, prev);
  }

  res.json({ success: true, customers: [...map.values()] });
});
