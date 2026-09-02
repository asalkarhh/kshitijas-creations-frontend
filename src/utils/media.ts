import { env } from '../app/config/env';

export const resolveMediaUrl = (path: string) => {
  if (/^(https?:|data:|blob:)/.test(path) || path.startsWith('/')) return path;
  return `${env.mediaBaseUrl}/${path.replace(/^\//, '')}`;
};
