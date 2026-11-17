import { Router } from 'express';
import { getDashboardStats, getRecentActivity } from '../controllers/dashboardController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(protect, adminOnly);
router.get('/stats', getDashboardStats);
router.get('/activity', getRecentActivity);

export default router;
