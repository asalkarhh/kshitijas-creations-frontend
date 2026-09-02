import { z } from 'zod';
import { isSafeUrl } from '../utils/url';

export const bannerSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Banner title is required.')
      .max(200, 'Title cannot exceed 200 characters.'),
    subtitle: z
      .string()
      .trim()
      .max(500, 'Subtitle cannot exceed 500 characters.')
      .optional()
      .or(z.literal('')),
    buttonText: z
      .string()
      .trim()
      .max(100, 'Button text cannot exceed 100 characters.')
      .optional()
      .or(z.literal('')),
    targetUrl: z
      .string()
      .trim()
      .optional()
      .or(z.literal(''))
      .refine(
        (url) => !url || isSafeUrl(url),
        'Target URL must be a relative link (e.g. /products) or a secure HTTPS link.',
      ),
    startAt: z.string().optional().or(z.literal('')),
    endAt: z.string().optional().or(z.literal('')),
    displayOrder: z
      .number()
      .int('Display order must be an integer.')
      .min(0, 'Display order must be a non-negative number.'),
    active: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.startAt && data.endAt) {
        const start = new Date(data.startAt);
        const end = new Date(data.endAt);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          return end > start;
        }
      }
      return true;
    },
    {
      message: 'End date and time must be later than start date and time.',
      path: ['endAt'],
    },
  );

export type BannerFormValues = z.infer<typeof bannerSchema>;

