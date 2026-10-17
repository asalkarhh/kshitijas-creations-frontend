import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { PagePreloader } from '../components/common/PagePreloader';

// Map specific routes to theme-tailored artisan one-liners
export const getThemeLineForPath = (pathname: string): string => {
  if (pathname.startsWith('/products/')) {
    return 'Unveiling exquisite handmade details & artisan finishing...';
  }
  if (pathname.startsWith('/products')) {
    return 'Curating handcrafted earrings, chokers & festive collections...';
  }
  if (pathname.startsWith('/categories')) {
    return 'Exploring curated earrings, necklaces, bangles & festive gifts...';
  }
  if (pathname.startsWith('/cart')) {
    return 'Gathering your selected handcrafted pieces...';
  }
  if (pathname.startsWith('/checkout')) {
    return 'Preparing secure delivery details for Pan-India shipment...';
  }
  if (pathname.startsWith('/order-success')) {
    return 'Celebrating your thoughtful handcrafted order...';
  }
  if (pathname.startsWith('/admin')) {
    return 'Opening private Artisan Atelier studio...';
  }
  if (pathname.startsWith('/privacy') || pathname.startsWith('/terms')) {
    return 'Loading studio care guidelines & customer policies...';
  }
  return 'Handcrafted jewellery & celebratory keepsakes, made with love';
};

export const PageTransitionPreloader = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [themeLine, setThemeLine] = useState(() => getThemeLineForPath(location.pathname));
  const isFirstRender = useRef(true);

  // In automated test environments, bypass navigation transition delay to keep test runner fast
  const isTestMode =
    typeof process !== 'undefined' &&
    (process.env.NODE_ENV === 'test' || import.meta.env.MODE === 'test');

  useEffect(() => {
    // Avoid artificial overlay on initial page load (Suspense handles initial code-splitting)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (isTestMode) return;

    setThemeLine(getThemeLineForPath(location.pathname));
    setIsLoading(true);

    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [location.pathname, location.search, isTestMode]);

  if (!isLoading || isTestMode) return null;

  return <PagePreloader fullscreen themeLine={themeLine} />;
};

