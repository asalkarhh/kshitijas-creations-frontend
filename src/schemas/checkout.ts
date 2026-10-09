import { z } from 'zod';

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters.')
    .max(150, 'Full name cannot exceed 150 characters.'),
  mobileNumber: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210).'),
  addressLine: z
    .string()
    .trim()
    .min(5, 'Delivery address must be at least 5 characters.')
    .max(500, 'Address cannot exceed 500 characters.'),
  city: z
    .string()
    .trim()
    .min(2, 'City must be at least 2 characters.')
    .max(100, 'City cannot exceed 100 characters.')
    .regex(/^[A-Za-z]+(?:[ .'-][A-Za-z]+)*$/, 'City can contain letters, spaces, hyphens, or apostrophes only.'),
  district: z
    .string()
    .trim()
    .min(2, 'District must be at least 2 characters.')
    .max(100, 'District cannot exceed 100 characters.')
    .regex(/^[A-Za-z]+(?:[ .'-][A-Za-z]+)*$/, 'District can contain letters, spaces, hyphens, or apostrophes only.'),
  subDistrict: z
    .string()
    .trim()
    .min(2, 'Subdistrict must be at least 2 characters.')
    .max(100, 'Subdistrict cannot exceed 100 characters.')
    .regex(/^[A-Za-z]+(?:[ .'-][A-Za-z]+)*$/, 'Subdistrict can contain letters, spaces, hyphens, or apostrophes only.'),
  state: z
    .string()
    .trim()
    .min(2, 'State is required.')
    .max(100, 'State cannot exceed 100 characters.'),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'PIN code must be exactly 6 digits (e.g. 415311).'),
  customerNote: z
    .string()
    .trim()
    .max(500, 'Customer note cannot exceed 500 characters.')
    .optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
