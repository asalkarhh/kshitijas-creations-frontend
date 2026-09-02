import { useLocation } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { usePageMetadata } from '../hooks/use-page-metadata';

const StaticPolicyPage = () => {
  const { pathname } = useLocation();
  const isPrivacy = pathname === '/privacy';
  const title = isPrivacy ? 'Privacy Policy' : 'Terms';
  usePageMetadata({
    title,
    description: `${title} placeholder for Kshitija's Creations.`,
    canonicalPath: pathname,
  });
  return (
    <div className="site-container py-12 sm:py-16">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: title }]} />
      <article className="mt-8 max-w-3xl rounded-3xl border border-beige bg-surface p-7 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-maroon/75">Placeholder</p>
        <h1 className="mt-2 font-display text-4xl text-ink">{title}</h1>
        <p className="mt-5 leading-7 text-muted">
          This page is reserved for the final {title.toLowerCase()} content before launch.
        </p>
      </article>
    </div>
  );
};

export default StaticPolicyPage;
