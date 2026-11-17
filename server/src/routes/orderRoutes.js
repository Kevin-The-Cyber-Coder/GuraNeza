import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  trackOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

// Public / customer
router.post('/', createOrder);
router.post('/track', trackOrder);
router.get('/my-orders', protect, getMyOrders);

// Admin
router.get('/', protect, adminOnly, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.delete('/:id', protect, adminOnly, deleteOrder);

export default router;
