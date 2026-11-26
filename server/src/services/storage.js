import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import env from '../config/env.js';

const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads');

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const extFromMime = (mimetype = '') => {
  const map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  };
  return map[mimetype] || '';
};

export const isCloudinaryConfigured = () =>
  Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);

export const saveImage = async (file, folder = 'misc') => {
  if (!file) return null;

  if (isCloudinaryConfigured()) {
    // Cloudinary integration can be added here when credentials are available.
    // Keeping the same return shape avoids changing callers.
    throw new Error('Cloudinary is configured but the Cloudinary uploader is not implemented yet.');
  }

  const safeFolder = String(folder).replace(/[^a-zA-Z0-9/_-]/g, '').replace(/\.\./g, '') || 'misc';
  const dir = path.join(UPLOAD_ROOT, safeFolder);
  await ensureDir(dir);

  const ext = extFromMime(file.mimetype) || path.extname(file.originalname || '').toLowerCase() || '.bin';
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
  const absolutePath = path.join(dir, filename);
  await fs.writeFile(absolutePath, file.buffer);

  const relativePath = `/uploads/${safeFolder}/${filename}`.replace(/\\/g, '/');
  return {
    url: relativePath,
    publicId: relativePath,
    provider: 'local',
    filename,
  };
};

export const removeImage = async (publicId) => {
  if (!publicId || isCloudinaryConfigured()) return;
  if (!String(publicId).startsWith('/uploads/')) return;
  const relative = String(publicId).replace(/^\/uploads\//, '');
  const absolute = path.resolve(UPLOAD_ROOT, relative);
  if (!absolute.startsWith(UPLOAD_ROOT)) return;
  try {
    await fs.unlink(absolute);
  } catch {
    // ignore missing files
  }
};

export const uploadRoot = UPLOAD_ROOT;
