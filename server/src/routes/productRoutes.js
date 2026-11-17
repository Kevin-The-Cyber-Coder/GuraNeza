import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getProductMeta,
  getTopSelling,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

// Public routes (specific paths before /:id so they aren't swallowed)
router.get('/', getProducts);
router.get('/meta', getProductMeta);
router.get('/top-selling', getTopSelling);
router.get('/:id', getProductById);

// Admin-only mutations
router.post('/', protect, adminOnly, createProduct);
router.post('/bulk-delete', protect, adminOnly, bulkDeleteProducts);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
