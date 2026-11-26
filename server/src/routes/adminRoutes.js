import { Router } from 'express';
import { protect, superAdminOnly } from '../middleware/auth.js';
import { listUsers, updateUserStatus, listShops, updateShopStatus, listAuditLogs } from '../controllers/adminController.js';

const router = Router();

router.use(protect, superAdminOnly);
router.get('/users', listUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/shops', listShops);
router.patch('/shops/:id/status', updateShopStatus);
router.get('/audit-logs', listAuditLogs);

export default router;
