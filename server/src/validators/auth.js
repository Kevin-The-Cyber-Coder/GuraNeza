import { z } from 'zod';

const email = z
  .string()
  .trim()
  .regex(/^\S+@\S+\.\S+$/, 'Please provide a valid email address')
  .transform((value) => value.toLowerCase());

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
  phone: z.string().trim().max(30).optional().default(''),
  address: z.string().trim().max(200).optional().default(''),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required').max(128),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(200).optional(),
  currentPassword: z.string().max(128).optional(),
  password: z.string().min(8).max(128).optional(),
});
