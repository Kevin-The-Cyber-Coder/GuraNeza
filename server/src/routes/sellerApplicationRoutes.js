import { Router } from 'express';
import {
  approveApplication,
  createApplication,
  getApplication,
  getApplicationStatus,
  listApplications,
  rejectApplication,
  resendInvitation,
} from '../controllers/sellerApplicationController.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { formLimiter } from '../middleware/security.js';
import { validate } from '../middleware/validate.js';
import {
  applicationStatusSchema,
  listApplicationsQuerySchema,
  rejectApplicationSchema,
  sellerApplicationSchema,
} from '../validators/sellerApplication.js';

const router = Router();

// Public
router.post('/', formLimiter, validate(sellerApplicationSchema), createApplication);
router.post('/status', formLimiter, validate(applicationStatusSchema), getApplicationStatus);

// Super Admin
router.use(protect, adminOnly);
router.get('/', validate(listApplicationsQuerySchema, 'query'), listApplications);
router.get('/:id', getApplication);
router.patch('/:id/approve', approveApplication);
router.patch('/:id/reject', validate(rejectApplicationSchema), rejectApplication);
router.post('/:id/resend-invitation', formLimiter, resendInvitation);

export default router;
