import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

export const Breadcrumbs = ({ items }: { items: BreadcrumbItem[] }) => (
  <nav aria-label="Breadcrumb">
    <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
      {items.map((item, index) => (
        <li className="flex items-center gap-1" key={`${item.label}-${index}`}>
          {index > 0 && <ChevronRight aria-hidden="true" className="size-4 text-beige" />}
          {item.to ? (
            <Link
              className="rounded hover:text-maroon focus-visible:outline focus-visible:outline-2 focus-visible:outline-maroon"
              to={item.to}
            >
              {item.label}
            </Link>
          ) : (
            <span aria-current="page" className="text-ink">
              {item.label}
            </span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);
