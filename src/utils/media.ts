import { env } from '../app/config/env';

export const resolveMediaUrl = (path: string) => {
  if (!path) return '';
  if (typeof window !== 'undefined' && /^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d+)?/i.test(path)) {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return path.replace(/^(https?:\/\/)(localhost|127\.0\.0\.1)/i, `$1${host}`);
    }
  }
  if (/^(https?:|data:|blob:)/.test(path) || path.startsWith('/')) return path;
  return `${env.mediaBaseUrl}/${path.replace(/^\//, '')}`;
};
