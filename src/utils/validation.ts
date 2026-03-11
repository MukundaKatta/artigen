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

// ── AI Generation ────────────────────────────────────────────────

export const generateImageSchema = z.object({
  prompt: z
    .string()
    .min(3, 'Prompt must be at least 3 characters')
    .max(2000, 'Prompt is too long'),
  negativePrompt: z.string().max(1000, 'Negative prompt is too long').optional(),
  modelId: z.string().min(1, 'Please select a model'),
  width: z.number().min(256).max(2048).optional(),
  height: z.number().min(256).max(2048).optional(),
  steps: z.number().min(1).max(150).optional(),
  cfgScale: z.number().min(0).max(30).optional(),
  seed: z.number().int().optional(),
});

// ── Marketplace ──────────────────────────────────────────────────

export const createListingSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title is too long'),
  description: z.string().max(2000, 'Description is too long').optional(),
  priceInCents: z
    .number()
    .min(100, 'Minimum price is $1.00')
    .max(1_000_000, 'Maximum price is $10,000'),
  tags: z.array(z.string().max(30)).max(10, 'Maximum 10 tags').optional(),
});

// ── Community ────────────────────────────────────────────────────

export const createCommunitySchema = z.object({
  name: z
    .string()
    .min(3, 'Community name must be at least 3 characters')
    .max(50, 'Community name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  rules: z.string().max(2000, 'Rules are too long').optional(),
});

// ── Messages ─────────────────────────────────────────────────────

export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(5000, 'Message is too long'),
});

// ── Reports ──────────────────────────────────────────────────────

export const reportSchema = z.object({
  reason: z.enum([
    'spam',
    'harassment',
    'hate_speech',
    'violence',
    'nudity',
    'false_information',
    'intellectual_property',
    'other',
  ]),
  description: z.string().max(1000, 'Description is too long').optional(),
});

// ── Type Exports ─────────────────────────────────────────────────

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type EditProfileFormData = z.infer<typeof editProfileSchema>;
export type CommentFormData = z.infer<typeof commentSchema>;
export type CaptionFormData = z.infer<typeof captionSchema>;
export type GenerateImageFormData = z.infer<typeof generateImageSchema>;
export type CreateListingFormData = z.infer<typeof createListingSchema>;
export type CreateCommunityFormData = z.infer<typeof createCommunitySchema>;
export type MessageFormData = z.infer<typeof messageSchema>;
export type ReportFormData = z.infer<typeof reportSchema>;
