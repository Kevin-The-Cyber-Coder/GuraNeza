import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getProductMeta,
  getTopSelling,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  uploadProductImages,
  removeProductImage,
} from '../controllers/productController.js';
import { protect, adminOnly, authorize } from '../middleware/auth.js';
import { uploadMultipleImages } from '../middleware/upload.js';

const router = Router();

// Public routes (specific paths before /:id so they aren't swallowed)
router.get('/', getProducts);
router.get('/meta', getProductMeta);
router.get('/top-selling', getTopSelling);
router.get('/mine', protect, authorize('admin', 'seller'), getMyProducts);
router.get('/:id', getProductById);

// Mutations
router.post('/', protect, authorize('admin', 'seller'), createProduct);
router.post('/bulk-delete', protect, adminOnly, bulkDeleteProducts);
router.post('/:id/images', protect, authorize('admin', 'seller'), uploadMultipleImages('images', 6), uploadProductImages);
router.post('/:id/images/remove', protect, authorize('admin', 'seller'), removeProductImage);
router.put('/:id', protect, authorize('admin', 'seller'), updateProduct);
router.delete('/:id', protect, authorize('admin', 'seller'), deleteProduct);

export default router;
