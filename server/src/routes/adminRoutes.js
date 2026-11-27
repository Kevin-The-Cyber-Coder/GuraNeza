import { Router } from 'express';
import { protect, superAdminOnly } from '../middleware/auth.js';
import { listUsers, updateUserStatus, listShops, updateShopStatus, listAuditLogs, getSecurityOverview, getCategoriesOverview, getPlatformSettings, getPlatformAnalytics } from '../controllers/adminController.js';

const router = Router();

router.use(protect, superAdminOnly);
router.get('/users', listUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/shops', listShops);
router.patch('/shops/:id/status', updateShopStatus);
router.get('/audit-logs', listAuditLogs);
router.get('/security-overview', getSecurityOverview);
router.get('/categories-overview', getCategoriesOverview);
router.get('/settings', getPlatformSettings);
router.get('/analytics', getPlatformAnalytics);

export default router;
