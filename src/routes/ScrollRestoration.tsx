import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollRestoration = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      window.requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView());
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [hash, pathname]);

  return null;
};
