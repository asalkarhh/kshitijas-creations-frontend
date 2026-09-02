import { z } from 'zod';
import { isSafeInstagramUrl } from '../utils/url';

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Category name is required.')
    .max(100, 'Category name cannot exceed 100 characters.'),
  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters.')
    .optional()
    .or(z.literal('')),
  displayOrder: z
    .number()
    .int('Display order must be an integer.')
    .min(0, 'Display order must be a non-negative number.'),
  active: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export const productSchema = z.object({
  categoryId: z.string().min(1, 'Please select a category.'),
  name: z
    .string()
    .trim()
    .min(1, 'Product name is required.')
    .max(200, 'Product name cannot exceed 200 characters.'),
  productCode: z
    .string()
    .trim()
    .min(1, 'Product code is required.')
    .max(50, 'Product code cannot exceed 50 characters.'),
  shortDescription: z
    .string()
    .trim()
    .max(500, 'Short description cannot exceed 500 characters.')
    .optional()
    .or(z.literal('')),
  description: z.string().trim().min(1, 'Product description is required.'),
  price: z
    .number()
    .min(0, 'Price must be greater than or equal to 0.')
    .refine((val) => Number.isFinite(val), 'Invalid price amount.'),
  available: z.boolean(),
  featured: z.boolean(),
  instagramUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine(
      (url) => isSafeInstagramUrl(url),
      'Instagram URL must use HTTPS and belong to instagram.com or instagr.am.',
    ),
  displayOrder: z
    .number()
    .int('Display order must be an integer.')
    .min(0, 'Display order must be a non-negative number.'),
});

export type ProductFormValues = z.infer<typeof productSchema>;

