import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be 30 characters or less')
    .regex(/^[a-zA-Z0-9._]+$/, 'Only letters, numbers, dots, and underscores'),
  fullName: z.string().min(1, 'Full name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const editProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be 30 characters or less')
    .regex(/^[a-zA-Z0-9._]+$/, 'Only letters, numbers, dots, and underscores'),
  fullName: z.string().min(1, 'Full name is required'),
  bio: z.string().max(150, 'Bio must be 150 characters or less').optional(),
  website: z.string().url('Please enter a valid URL').or(z.literal('')).optional(),
});

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(2200, 'Comment is too long'),
});

export const captionSchema = z.object({
  caption: z.string().max(2200, 'Caption is too long').optional(),
  location: z.string().max(100).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type EditProfileFormData = z.infer<typeof editProfileSchema>;
export type CommentFormData = z.infer<typeof commentSchema>;
export type CaptionFormData = z.infer<typeof captionSchema>;
