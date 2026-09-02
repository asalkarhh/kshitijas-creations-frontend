/**
 * Validates that a link is safe for navigation.
 * Allows internal routes starting with '/' or secure external URLs with https:// or http://.
 * Explicitly rejects javascript:, data:, vbscript:, and other unsafe client-side schemes.
 */
export const isSafeUrl = (url?: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

/**
 * Checks whether a URL is an external link (starts with http/https).
 */
export const isExternalUrl = (url?: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed);
};

/**
 * Validates that an Instagram URL uses HTTPS and belongs to the official Instagram domain.
 */
export const isSafeInstagramUrl = (url?: string): boolean => {
  if (!url || typeof url !== 'string') return true; // Optional field
  const trimmed = url.trim();
  if (!trimmed) return true;
  try {
    const parsed = new URL(trimmed);
    const validHostnames = ['instagram.com', 'www.instagram.com', 'instagr.am', 'www.instagr.am'];
    return parsed.protocol === 'https:' && validHostnames.includes(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
};
