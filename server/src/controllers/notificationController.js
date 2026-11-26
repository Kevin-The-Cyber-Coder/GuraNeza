import Notification from '../models/Notification.js';
import { asyncHandler } from '../middleware/error.js';

export const getMyNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const query = { recipient: req.user._id };
  if (req.query.unread === 'true') query.readAt = null;

  const [items, total, unreadCount] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Notification.countDocuments(query),
    Notification.countDocuments({ recipient: req.user._id, readAt: null }),
  ]);

  res.json({ success: true, notifications: items, page, pages: Math.ceil(total / limit), total, unreadCount });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
  if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
  if (!notification.readAt) {
    notification.readAt = new Date();
    await notification.save();
  }
  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, readAt: null });
  res.json({ success: true, notification, unreadCount });
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, readAt: null }, { $set: { readAt: new Date() } });
  res.json({ success: true, unreadCount: 0 });
});
