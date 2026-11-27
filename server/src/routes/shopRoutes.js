import { Router } from 'express';
import { protect, sellerOnly } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { uploadSingleImage } from '../middleware/upload.js';
import { updateShopSchema } from '../validators/shop.js';
import { getMyShop, updateMyShop, uploadLogo, uploadCover, getMyShopAnalytics, getMyShopCustomers } from '../controllers/shopController.js';

const router = Router();

router.use(protect, sellerOnly);
router.get('/me', getMyShop);
router.put('/me', validate(updateShopSchema), updateMyShop);
router.post('/me/logo', uploadSingleImage('logo'), uploadLogo);
router.post('/me/cover', uploadSingleImage('cover'), uploadCover);
router.get('/me/analytics', getMyShopAnalytics);
router.get('/me/customers', getMyShopCustomers);

export default router;
