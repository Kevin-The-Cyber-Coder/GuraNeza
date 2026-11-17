import { Router } from 'express';
import {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
} from '../controllers/contactController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.post('/', createContact);
router.get('/', protect, adminOnly, getContacts);
router.get('/:id', protect, adminOnly, getContactById);
router.put('/:id', protect, adminOnly, updateContact);
router.delete('/:id', protect, adminOnly, deleteContact);

export default router;
