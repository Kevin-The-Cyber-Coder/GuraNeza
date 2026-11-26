import { Router } from 'express';
import {
  activateSeller,
  validateInvitation,
} from '../controllers/sellerInvitationController.js';
import { formLimiter } from '../middleware/security.js';
import { validate } from '../middleware/validate.js';
import {
  activateSellerSchema,
  invitationTokenQuerySchema,
} from '../validators/sellerApplication.js';

const router = Router();

router.get(
  '/validate',
  formLimiter,
  validate(invitationTokenQuerySchema, 'query'),
  validateInvitation
);
router.post('/activate', formLimiter, validate(activateSellerSchema), activateSeller);

export default router;
