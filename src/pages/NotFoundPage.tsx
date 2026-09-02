import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageMetadata } from '../hooks/use-page-metadata';

const NotFoundPage = () => {
  usePageMetadata({
    title: 'Page not found',
    description: 'The requested page could not be found.',
  });
  return (
    <div className="site-container grid min-h-[62vh] place-items-center py-16 text-center">
      <div>
        <p className="font-display text-7xl text-rose sm:text-8xl">404</p>
        <h1 className="mt-3 font-display text-4xl text-ink">This page wandered away</h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-muted">
          The link may be old, or the page may have moved. The collection is still right where you
          left it.
        </p>
        <Link className="button-primary mt-7" to="/">
          <ArrowLeft aria-hidden="true" className="size-4" /> Return home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
