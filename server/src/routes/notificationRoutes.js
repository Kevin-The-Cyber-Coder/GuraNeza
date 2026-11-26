import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { getMyNotifications, markNotificationRead, markAllNotificationsRead } from '../controllers/notificationController.js';

const router = Router();

router.use(protect);
router.get('/me', getMyNotifications);
router.patch('/:id/read', markNotificationRead);
router.patch('/read-all', markAllNotificationsRead);

export default router;
