const stripTrailingSlash = (value: string) => value.replace(/\/$/, '');
const browserHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const defaultApiBaseUrl = `http://${browserHost}:8080/api/v1`;
const defaultMediaBaseUrl = `http://${browserHost}:8080/media`;

const resolveNetworkUrl = (value: string | undefined, fallback: string) => {
  const configured = value ?? fallback;
  if (typeof window === 'undefined') return configured;

  try {
    const url = new URL(configured, window.location.origin);
    if (
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1') &&
      browserHost !== 'localhost' &&
      browserHost !== '127.0.0.1'
    ) {
      url.hostname = browserHost;
    }
    return url.toString().replace(/\/$/, '');
  } catch {
    return configured;
  }
};

export const env = Object.freeze({
  apiBaseUrl: stripTrailingSlash(
    resolveNetworkUrl(import.meta.env.VITE_API_BASE_URL, defaultApiBaseUrl),
  ),
  mediaBaseUrl: stripTrailingSlash(
    resolveNetworkUrl(import.meta.env.VITE_MEDIA_BASE_URL, defaultMediaBaseUrl),
  ),
  instagramUrl:
    import.meta.env.VITE_INSTAGRAM_URL ?? 'https://www.instagram.com/kshitijas_creations/',
  instagramChatUrl:
    import.meta.env.VITE_INSTAGRAM_CHAT_URL ?? 'https://ig.me/m/kshitijas_creations',
  siteUrl: stripTrailingSlash(import.meta.env.VITE_SITE_URL ?? window.location.origin),
});
