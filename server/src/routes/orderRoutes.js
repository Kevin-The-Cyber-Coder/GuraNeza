import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  trackOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getSellerOrders,
} from '../controllers/orderController.js';
import { protect, adminOnly, sellerOnly, authorize } from '../middleware/auth.js';

const router = Router();

// Public / customer
router.post('/', createOrder);
router.post('/track', trackOrder);
router.get('/my-orders', protect, getMyOrders);

// Seller
router.get('/seller/mine', protect, sellerOnly, getSellerOrders);

// Admin
router.get('/', protect, adminOnly, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, authorize('admin', 'seller'), updateOrderStatus);
router.delete('/:id', protect, adminOnly, deleteOrder);

export default router;
