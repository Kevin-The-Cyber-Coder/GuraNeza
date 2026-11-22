import { z } from 'zod';

const email = z
  .string()
  .trim()
  .regex(/^\S+@\S+\.\S+$/, 'Please provide a valid email address')
  .transform((value) => value.toLowerCase());

export const sellerApplicationSchema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name').max(120),
  email,
  phone: z.string().trim().min(7, 'Please enter a valid phone number').max(30),
  businessName: z.string().trim().max(120).optional().default(''),
  businessLocation: z.string().trim().min(2, 'Business location is required').max(200),
  businessDescription: z
    .string()
    .trim()
    .min(20, 'Please describe your business in at least 20 characters')
    .max(2000),
  businessCategory: z.string().trim().min(2, 'Business category is required').max(80),
  reason: z
    .string()
    .trim()
    .min(20, 'Please tell us why you want to join in at least 20 characters')
    .max(1000),
  supportingInfo: z.string().trim().max(2000).optional().default(''),
});

export const applicationStatusSchema = z.object({
  referenceNumber: z.string().trim().min(3).max(40),
  email,
});

export const rejectApplicationSchema = z.object({
  reason: z.string().trim().min(5, 'Please provide a rejection reason').max(1000),
});

export const listApplicationsQuerySchema = z.object({
  status: z.enum(['all', 'pending', 'approved', 'rejected']).optional().default('all'),
  search: z.string().trim().max(120).optional().default(''),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const invitationTokenQuerySchema = z.object({
  token: z.string().min(20, 'Activation token is required').max(200),
});

export const activateSellerSchema = z
  .object({
    token: z.string().min(20, 'Activation token is required').max(200),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
    confirmPassword: z.string().min(8, 'Please confirm your password').max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
