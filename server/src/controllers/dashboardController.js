import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Contact from '../models/Contact.js';
import { asyncHandler } from '../middleware/error.js';

// @desc    Aggregate key metrics for the admin dashboard, including daily sales
// @route   GET /api/dashboard/stats
// @access  Admin
export const getDashboardStats = asyncHandler(async (_req, res) => {
  const [orderStats, productStats, userCount, newContacts] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: null,
          orders: { $sum: 1 },
          revenue: { $sum: '$pricing.total' },
          avgOrder: { $avg: '$pricing.total' },
        },
      },
    ]),
    Product.aggregate([
      {
        $group: {
          _id: null,
          products: { $sum: 1 },
          lowStock: { $sum: { $cond: [{ $lt: ['$stock', 10] }, 1, 0] } },
        },
      },
    ]),
    User.countDocuments({ role: 'user' }),
    Contact.countDocuments({ status: 'New' }),
  ]);

  // Revenue and order counts for the last 7 / 30 days.
  const daily = await Order.aggregate([
    { $match: { status: { $ne: 'Cancelled' } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        orders: { $sum: 1 },
        revenue: { $sum: '$pricing.total' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const map = new Map(daily.map((d) => [d._id, d]));
  const buildSeries = (days) => {
    const series = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      const entry = map.get(key) || { orders: 0, revenue: 0 };
      series.push({
        date: key,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
        ...entry,
      });
    }
    return series;
  };

  // Status breakdown
  const statusCounts = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    stats: {
      revenue: orderStats[0]?.revenue || 0,
      orders: orderStats[0]?.orders || 0,
      avgOrder: orderStats[0]?.avgOrder || 0,
      products: productStats[0]?.products || 0,
      lowStock: productStats[0]?.lowStock || 0,
      customers: userCount,
      newMessages: newContacts,
    },
    weekly: buildSeries(7),
    monthly: buildSeries(30),
    statuses: statusCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
  });
});

// @desc    Recent activity feed (latest orders + contacts)
// @route   GET /api/dashboard/activity
// @access  Admin
export const getRecentActivity = asyncHandler(async (_req, res) => {
  const [orders, contacts] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).limit(6).select('orderNumber customer status pricing total createdAt').lean(),
    Contact.find().sort({ createdAt: -1 }).limit(4).select('name subject status createdAt').lean(),
  ]);

  const activity = [
    ...orders.map((o) => ({
      type: 'order',
      id: o._id,
      title: `New order ${o.orderNumber}`,
      subtitle: `${o.customer?.name || 'Customer'} · ${o.pricing?.total || 0} RWF`,
      status: o.status,
      date: o.createdAt,
    })),
    ...contacts.map((c) => ({
      type: 'contact',
      id: c._id,
      title: `Message from ${c.name}`,
      subtitle: c.subject,
      status: c.status,
      date: c.createdAt,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({ success: true, activity });
});
