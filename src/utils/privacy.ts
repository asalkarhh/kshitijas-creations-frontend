/**
 * Masks a mobile number for list display while preserving prefix/country code and ending digits.
 * Example: "9876543210" -> "+91 98*** **210" or "98***210"
 */
export const maskMobileNumber = (phone?: string): string => {
  if (!phone) return '—';
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 10) return '—';

  // Take the last 10 digits as the core phone number
  const core = digitsOnly.slice(-10);
  const first2 = core.slice(0, 2);
  const last3 = core.slice(-3);

  return `+91 ${first2}*** **${last3}`;
};

