import { useEffect } from 'react';
import { env } from '../app/config/env';

interface PageMetadata {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string;
  keywords?: string;
  jsonLd?: Record<string, unknown>;
}

const setMetaContent = (selector: string, content: string) => {
  let meta = document.querySelector<HTMLMetaElement>(selector);
  if (!meta) {
    meta = document.createElement('meta');
    if (selector.startsWith('meta[name="')) {
      const name = selector.slice(11, -2);
      meta.setAttribute('name', name);
    } else if (selector.startsWith('meta[property="')) {
      const property = selector.slice(15, -2);
      meta.setAttribute('property', property);
    }
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
};

export const usePageMetadata = ({
  title,
  description,
  canonicalPath,
  image,
  keywords,
  jsonLd,
}: PageMetadata) => {
  useEffect(() => {
    document.title = `${title} | Kshitija's Creations`;
    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[property="og:title"]', title);
    setMetaContent('meta[property="og:description"]', description);
    setMetaContent('meta[name="twitter:title"]', title);
    setMetaContent('meta[name="twitter:description"]', description);

    if (keywords) {
      setMetaContent('meta[name="keywords"]', keywords);
    }

    if (image) {
      setMetaContent('meta[property="og:image"]', image);
      setMetaContent('meta[name="twitter:image"]', image);
    }

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    const fullCanonical = `${env.siteUrl}${canonicalPath ?? window.location.pathname}`;
    canonical.href = fullCanonical;
    setMetaContent('meta[property="og:url"]', fullCanonical);

    let jsonLdScript = document.querySelector<HTMLScriptElement>('script[data-schema="page-jsonld"]');
    if (jsonLd) {
      if (!jsonLdScript) {
        jsonLdScript = document.createElement('script');
        jsonLdScript.type = 'application/ld+json';
        jsonLdScript.setAttribute('data-schema', 'page-jsonld');
        document.head.appendChild(jsonLdScript);
      }
      jsonLdScript.textContent = JSON.stringify(jsonLd);
    } else if (jsonLdScript) {
      jsonLdScript.remove();
    }

    return () => {
      const script = document.querySelector<HTMLScriptElement>('script[data-schema="page-jsonld"]');
      if (script) {
        script.remove();
      }
    };
  }, [canonicalPath, description, image, jsonLd, keywords, title]);
};

