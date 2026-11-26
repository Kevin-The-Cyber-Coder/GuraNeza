import multer from 'multer';
import env from '../config/env.js';

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const maxBytes = Math.max(1, Number(env.UPLOAD_MAX_MB || 5)) * 1024 * 1024;

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxBytes },
  fileFilter: (_req, file, cb) => {
    if (!allowed.has(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, WEBP, and GIF images are allowed'));
    }
    return cb(null, true);
  },
});

export const uploadSingleImage = (field = 'image') => upload.single(field);
export const uploadMultipleImages = (field = 'images', max = 6) => upload.array(field, max);
