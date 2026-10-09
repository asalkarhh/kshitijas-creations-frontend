const stripTrailingSlash = (value: string) => value.replace(/\/$/, '');
const apiHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const defaultApiBaseUrl = `http://${apiHost}:8080/api/v1`;
const defaultMediaBaseUrl = `http://${apiHost}:8080/media`;

export const env = Object.freeze({
  apiBaseUrl: stripTrailingSlash(
    import.meta.env.VITE_API_BASE_URL ?? defaultApiBaseUrl,
  ),
  mediaBaseUrl: stripTrailingSlash(
    import.meta.env.VITE_MEDIA_BASE_URL ?? defaultMediaBaseUrl,
  ),
  instagramUrl:
    import.meta.env.VITE_INSTAGRAM_URL ?? 'https://www.instagram.com/kshitijas_creations/',
  instagramChatUrl:
    import.meta.env.VITE_INSTAGRAM_CHAT_URL ?? 'https://ig.me/m/kshitijas_creations',
  siteUrl: stripTrailingSlash(import.meta.env.VITE_SITE_URL ?? window.location.origin),
});
