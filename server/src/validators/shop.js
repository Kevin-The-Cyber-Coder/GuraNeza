import { z } from 'zod';

export const updateShopSchema = z.object({
  name: z.string().trim().min(2, 'Shop name is required').max(120),
  description: z.string().trim().max(2000).optional().default(''),
  phone: z.string().trim().max(30).optional().default(''),
  email: z
    .string()
    .trim()
    .email('Please provide a valid email address')
    .optional()
    .or(z.literal(''))
    .default(''),
  location: z.string().trim().max(200).optional().default(''),
});
