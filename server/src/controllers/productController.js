import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { asyncHandler } from '../middleware/error.js';
import { httpError } from '../utils/text.js';
import { ensureShopForSeller } from '../services/shops.js';
import { saveImage, removeImage } from '../services/storage.js';
import { recordAudit } from '../services/audit.js';
import { hasRole, ROLES } from '../config/rbac.js';

// Escape user-supplied text before using it in a MongoDB regex.
const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildQuery = (q) => {
  const query = {};
  const keyword = q.keyword || q.search;
  if (keyword) {
    const safe = escapeRegex(keyword);
    query.$or = [
      { name: { $regex: safe, $options: 'i' } },
      { description: { $regex: safe, $options: 'i' } },
      { brand: { $regex: safe, $options: 'i' } },
      { tags: { $regex: safe, $options: 'i' } },
    ];
  }
  if (q.category && q.category !== 'All') query.category = q.category;
  if (q.brand) query.brand = q.brand;
  if (q.shop) query.shop = q.shop;
  if (q.seller) query.seller = q.seller;
  if (q.status) query.status = q.status;
  if (q.minPrice || q.maxPrice) {
    query.price = {};
    if (q.minPrice) query.price.$gte = Number(q.minPrice);
    if (q.maxPrice) query.price.$lte = Number(q.maxPrice);
  }
  if (q.featured === 'true') query.featured = true;
  if (q.inStock === 'true') query.stock = { $gt: 0 };
  return query;
};

const assertCanManageProduct = (req, product) => {
  if (hasRole(req.user, ROLES.SUPER_ADMIN)) return;
  if (hasRole(req.user, ROLES.SELLER) && String(product.seller) === String(req.user._id)) return;
  throw httpError(403, 'You do not have permission to manage this product');
};

// @desc    List products with search / filter / sort / pagination
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(60, Number(req.query.limit) || 12);
  const query = buildQuery(req.query);
  if (!query.status) query.status = 'published';

  const sortMap = {
    newest: { createdAt: -1 },
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    popular: { sold: -1 },
    rating: { rating: -1 },
    name: { name: 1 },
  };
  const sort = sortMap[req.query.sort] || { featured: -1, createdAt: -1 };

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('shop', 'name slug logo status')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  res.json({
    success: true,
    products,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Get a single product by id or slug
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product =
    (await Product.findById(id).populate('shop', 'name slug logo status').catch(() => null)) ||
    (await Product.findOne({ slug: id }).populate('shop', 'name slug logo status').catch(() => null));

  if (!product || (product.status !== 'published' && !req.user)) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  if (product.status !== 'published') {
    const isOwner = req.user && String(product.seller) === String(req.user._id);
    const isAdmin = req.user && hasRole(req.user, ROLES.SUPER_ADMIN);
    if (!isOwner && !isAdmin) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
  }

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    status: 'published',
  })
    .limit(4)
    .lean();

  res.json({ success: true, product, related });
});

// @desc    Create a product
// @route   POST /api/products
// @access  Admin
export const getMyProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(60, Number(req.query.limit) || 20);
  const query = buildQuery(req.query);
  delete query.status; // allow all statuses for owner, unless explicitly filtered
  if (req.query.status) query.status = req.query.status;

  if (hasRole(req.user, ROLES.SELLER)) {
    const shop = await ensureShopForSeller(req.user);
    query.seller = req.user._id;
    query.shop = shop._id;
  }

  const sortMap = {
    newest: { createdAt: -1 },
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    popular: { sold: -1 },
    rating: { rating: -1 },
    name: { name: 1 },
  };
  const sort = sortMap[req.query.sort] || { createdAt: -1 };

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('shop', 'name slug logo status')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  res.json({ success: true, products, page, pages: Math.ceil(total / limit), total });
});

export const createProduct = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  delete payload._id;
  delete payload.createdAt;
  delete payload.updatedAt;
  delete payload.slug;
  delete payload.sold;
  delete payload.rating;
  delete payload.numReviews;

  if (hasRole(req.user, ROLES.SELLER)) {
    const shop = await ensureShopForSeller(req.user);
    payload.seller = req.user._id;
    payload.shop = shop._id;
    payload.status = payload.status === 'draft' ? 'draft' : 'published';
  }

  const product = await Product.create(payload);
  await recordAudit({
    req,
    action: 'product.created',
    entityType: 'Product',
    entityId: product._id,
    metadata: { sellerId: product.seller, shopId: product.shop },
  });
  res.status(201).json({ success: true, message: 'Product created successfully', product });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  assertCanManageProduct(req, product);

  const { _id: _id, slug: _slug, createdAt: _createdAt, updatedAt: _updatedAt, seller: _seller, shop: _shop, sold: _sold, rating: _rating, numReviews: _numReviews, ...updates } = req.body;
  if (hasRole(req.user, ROLES.SELLER)) {
    delete updates.featured; // only admin can feature
  }
  Object.assign(product, updates);
  await product.save();

  await recordAudit({
    req,
    action: 'product.updated',
    entityType: 'Product',
    entityId: product._id,
    metadata: { sellerId: product.seller, shopId: product.shop },
  });
  res.json({ success: true, message: 'Product updated successfully', product });
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  assertCanManageProduct(req, product);
  await product.deleteOne();
  await recordAudit({
    req,
    action: 'product.deleted',
    entityType: 'Product',
    entityId: product._id,
    metadata: { sellerId: product.seller, shopId: product.shop },
  });
  res.json({ success: true, message: 'Product deleted successfully' });
});

export const uploadProductImages = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  assertCanManageProduct(req, product);
  if (!req.files?.length) throw httpError(400, 'Please select at least one image');

  const uploaded = [];
  for (const file of req.files) {
    const saved = await saveImage(file, `products/${product._id}`);
    uploaded.push(saved.url);
  }
  product.images = [...(product.images || []), ...uploaded].slice(0, 8);
  await product.save();

  res.json({ success: true, message: 'Images uploaded successfully', product, images: product.images });
});

export const removeProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  assertCanManageProduct(req, product);
  const { imageUrl } = req.body;
  if (!imageUrl) throw httpError(400, 'imageUrl is required');
  product.images = (product.images || []).filter((img) => img !== imageUrl);
  await product.save();
  await removeImage(imageUrl);
  res.json({ success: true, message: 'Image removed', product, images: product.images });
});

// @desc    Bulk delete products
// @route   POST /api/products/bulk-delete
// @access  Admin
export const bulkDeleteProducts = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || !ids.length) {
    return res.status(400).json({ success: false, message: 'No product ids supplied' });
  }
  const result = await Product.deleteMany({ _id: { $in: ids } });
  res.json({ success: true, message: `${result.deletedCount} product(s) deleted` });
});

// @desc    Product catalogue overview (categories, counts) for admin dashboard
// @route   GET /api/products/meta
// @access  Public
export const getProductMeta = asyncHandler(async (_req, res) => {
  const categories = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  const totals = await Product.aggregate([
    {
      $group: {
        _id: null,
        products: { $sum: 1 },
        inStock: { $sum: { $cond: [{ $gt: ['$stock', 0] }, 1, 0] } },
        outOfStock: { $sum: { $cond: [{ $lte: ['$stock', 0] }, 1, 0] } },
        inventoryValue: { $sum: { $multiply: ['$price', '$stock'] } },
      },
    },
  ]);
  res.json({
    success: true,
    categories: categories.map((c) => ({ name: c._id, count: c.count })),
    stats: totals[0] || { products: 0, inStock: 0, outOfStock: 0, inventoryValue: 0 },
  });
});

// @desc    Best selling products
// @route   GET /api/products/top-selling
// @access  Public
export const getTopSelling = asyncHandler(async (_req, res) => {
  const products = await Order.aggregate([
    { $match: { status: { $ne: 'Cancelled' } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.product', units: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
    { $sort: { units: -1 } },
    { $limit: 6 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $project: {
        _id: '$product._id',
        name: '$product.name',
        image: { $arrayElemAt: ['$product.images', 0] },
        price: '$product.price',
        units: 1,
        revenue: 1,
      },
    },
  ]);
  res.json({ success: true, products });
});
