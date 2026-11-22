import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env before anything else reads process.env.
dotenv.config();

const emailPattern = /^\S+@\S+\.\S+$/;

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),

  MONGO_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/guraneza'),
  JWT_SECRET: z.string().min(16).optional(),
  JWT_EXPIRES_IN: z.string().min(1).default('30d'),

  CLIENT_URL: z.string().default('http://localhost:5173'),
  APP_URL: z.string().default('http://localhost:5173'),

  ADMIN_EMAIL: z.string().regex(emailPattern).default('admin@guraneza.rw'),
  ADMIN_PASSWORD: z.string().min(6).default('Admin@123'),
  ADMIN_NAME: z.string().min(2).default('GuraNeza Admin'),

  RESEND_API_KEY: z.string().default(''),
  EMAIL_FROM: z.string().default('GuraNeza <onboarding@resend.dev>'),

  SELLER_INVITE_TTL_HOURS: z.coerce.number().int().positive().max(720).default(72),

  CLOUDINARY_CLOUD_NAME: z.string().default(''),
  CLOUDINARY_API_KEY: z.string().default(''),
  CLOUDINARY_API_SECRET: z.string().default(''),
  UPLOAD_MAX_MB: z.coerce.number().positive().max(25).default(5),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  console.error(`\n[env] Invalid environment configuration:\n${details}\n`);
  process.exit(1);
}

const data = parsed.data;
const production = data.NODE_ENV === 'production';

if (!data.JWT_SECRET) {
  if (production) {
    console.error('\n[env] JWT_SECRET is required in production.\n');
    process.exit(1);
  }
  data.JWT_SECRET = 'guraneza_dev_secret_change_me_32_chars';
}

if (production && !data.RESEND_API_KEY) {
  console.warn('[env] RESEND_API_KEY is not set. Transactional email is disabled.');
}
if (production && (!data.CLOUDINARY_CLOUD_NAME || !data.CLOUDINARY_API_KEY)) {
  console.warn('[env] Cloudinary is not configured. Image uploads are disabled.');
}

export const env = data;
export const isProd = production;
export const isTest = data.NODE_ENV === 'test';
export const isDev = data.NODE_ENV === 'development';

export default env;
