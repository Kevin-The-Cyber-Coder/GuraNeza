import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/error.js';
import { hasRole, ROLES } from '../config/rbac.js';

const VALID_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const SHIPPING_FEE = 2000; // 2,000 RWF flat delivery fee inside Kigali

// @desc    Place a new order (works for guests and logged-in users)
// @route   POST /api/orders
// @access  Public
export const createOrder = asyncHandler(async (req, res) => {
  const { items, customer, shipping, paymentMethod } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Your cart is empty' });
  }
  for (const field of ['name', 'email', 'phone']) {
    if (!customer?.[field]) {
      return res.status(400).json({ success: false, message: `Customer ${field} is required` });
    }
  }
  if (!shipping?.address) {
    return res.status(400).json({ success: false, message: 'Delivery address is required' });
  }

  // Re-fetch prices from the database so the client cannot tamper with them.
  const orderItems = [];
  let subtotal = 0;
  for (const item of items) {
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Item quantities must be positive whole numbers' });
    }
    const product = await Product.findById(item.product || item._id);
    if (!product) return res.status(404).json({ success: false, message: `One of your items no longer exists` });
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} unit(s) of "${product.name}" are available`,
      });
    }
    const lineTotal = product.price * quantity;
    subtotal += lineTotal;
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || '',
      price: product.price,
      quantity,
    });
  }

  const total = subtotal + SHIPPING_FEE;
  const order = await Order.create({
    orderNumber: undefined,
    user: req.user?._id || null,
    customer: {
      name: customer.name.trim(),
      email: customer.email.toLowerCase().trim(),
      phone: customer.phone.trim(),
    },
    shipping: {
      address: shipping.address.trim(),
      city: shipping.city || 'Kigali',
      district: shipping.district || '',
      country: shipping.country || 'Rwanda',
      notes: shipping.notes || '',
    },
    items: orderItems,
    pricing: { subtotal, shippingFee: SHIPPING_FEE, discount: 0, total },
    paymentMethod: paymentMethod || 'cash-on-delivery',
  });

  // Atomically reduce stock (guarded so two concurrent checkouts cannot oversell).
  const reserved = [];
  for (const item of orderItems) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity, sold: item.quantity } },
      { new: true }
    );
    if (!updated) {
      // Roll back only the items whose stock was actually reserved.
      await Promise.all(
        reserved.map((reservedItem) =>
          Product.findByIdAndUpdate(reservedItem.product, {
            $inc: { stock: reservedItem.quantity, sold: -reservedItem.quantity },
          })
        )
      );
      await Order.findByIdAndDelete(order._id);
      return res.status(400).json({
        success: false,
        message: `Sorry, "${item.name}" just went out of stock. Please review your cart.`,
      });
    }
    reserved.push(item);
  }

  res.status(201).json({
    success: true,
    message: 'Order placed successfully. Thank you for shopping with GuraNeza!',
    order,
  });
});

// @desc    Get orders for the logged-in user
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, orders });
});

// @desc    Track an order by order number + email (guest friendly)
// @route   POST /api/orders/track
// @access  Public
export const trackOrder = asyncHandler(async (req, res) => {
  const { orderNumber, email } = req.body;
  if (!orderNumber || !email) {
    return res.status(400).json({ success: false, message: 'Order number and email are required' });
  }
  const order = await Order.findOne({
    orderNumber: orderNumber.trim().toUpperCase(),
    'customer.email': email.toLowerCase().trim(),
  }).lean();

  if (!order) {
    return res.status(404).json({ success: false, message: 'No order found with that number and email' });
  }
  res.json({ success: true, order });
});

// @desc    Get all orders (admin) with optional status filter
// @route   GET /api/orders
// @access  Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status && req.query.status !== 'All') filter.status = req.query.status;
  if (req.query.search) {
    const safe = String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { orderNumber: { $regex: safe, $options: 'i' } },
      { 'customer.name': { $regex: safe, $options: 'i' } },
      { 'customer.email': { $regex: safe, $options: 'i' } },
    ];
  }
  const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ success: true, orders, count: orders.length });
});

// @desc    Get a single order by id
// @route   GET /api/orders/:id
// @access  Admin or the owner
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone').lean();
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const isOwner = order.user && String(order.user._id || order.user) === String(req.user?._id);
  if (!hasRole(req.user, ROLES.SUPER_ADMIN) && !isOwner) {
    return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
  }
  res.json({ success: true, order });
});

// @desc    Update the status of an order (admin)
// @route   PUT /api/orders/:id/status
// @access  Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid order status' });
  }

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const previousStatus = order.status;
  order.status = status;
  order.timeline.push({ status, note: note || `Status updated to ${status}` });

  // Restock items when an order is cancelled.
  if (status === 'Cancelled' && previousStatus !== 'Cancelled') {
    await Promise.all(
      order.items.map((item) =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity, sold: -item.quantity },
        })
      )
    );
  }

  await order.save();
  res.json({ success: true, message: 'Order status updated', order });
});

// @desc    Delete an order (admin)
// @route   DELETE /api/orders/:id
// @access  Admin
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  // Return stock unless the order had already been cancelled (which restocked it).
  if (order.status !== 'Cancelled') {
    await Promise.all(
      order.items.map((item) =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity, sold: -item.quantity },
        })
      )
    );
  }

  await order.deleteOne();
  res.json({ success: true, message: 'Order deleted' });
});

// @desc    Get orders containing products owned by the logged-in seller
// @route   GET /api/orders/seller/mine
// @access  Seller
export const getSellerOrders = asyncHandler(async (req, res) => {
  const sellerProducts = await Product.find({ seller: req.user._id }).select('_id').lean();
  const productIds = sellerProducts.map((p) => p._id);
  if (productIds.length === 0) return res.json({ success: true, orders: [] });

  const orders = await Order.find({ 'items.product': { $in: productIds } })
    .sort({ createdAt: -1 })
    .lean();

  // Limit to seller's own items and hide other sellers' line items; keep customer info necessary for fulfillment.
  const sanitized = orders.map((o) => {
    const items = o.items.filter((it) => productIds.some((id) => String(id) === String(it.product)));
    const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    return {
      _id: o._id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt,
      customer: { name: o.customer?.name, phone: o.customer?.phone, email: o.customer?.email },
      shipping: o.shipping,
      items,
      sellerSubtotal: subtotal,
      timeline: o.timeline,
    };
  });

  res.json({ success: true, orders: sanitized });
});
