const stripTrailingSlash = (value: string) => value.replace(/\/$/, '');

export const env = Object.freeze({
  apiBaseUrl: stripTrailingSlash(
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
  ),
  mediaBaseUrl: stripTrailingSlash(
    import.meta.env.VITE_MEDIA_BASE_URL ?? 'http://localhost:8080/uploads',
  ),
  instagramUrl:
    import.meta.env.VITE_INSTAGRAM_URL ?? 'https://www.instagram.com/kshitijas_creations/',
  siteUrl: stripTrailingSlash(import.meta.env.VITE_SITE_URL ?? window.location.origin),
});
