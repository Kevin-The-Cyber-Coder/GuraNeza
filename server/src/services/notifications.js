import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const notifyAdmins = async ({ type, title, message, link = '', metadata = {} }) => {
  try {
    const admins = await User.find({ role: 'admin', isActive: true }).select('_id').lean();
    if (!admins.length) return [];
    const docs = admins.map((admin) => ({
      recipient: admin._id,
      type,
      title,
      message,
      link,
      metadata,
    }));
    return await Notification.insertMany(docs);
  } catch (error) {
    console.error(`[notifications] Failed to create admin notifications: ${error.message}`);
    return [];
  }
};

export const notifyUser = async ({ recipient, type, title, message, link = '', metadata = {} }) => {
  try {
    return await Notification.create({ recipient, type, title, message, link, metadata });
  } catch (error) {
    console.error(`[notifications] Failed to create user notification: ${error.message}`);
    return null;
  }
};
