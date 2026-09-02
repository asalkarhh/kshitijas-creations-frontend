import { Instagram, Menu, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { env } from '../../app/config/env';
import { useCart } from '../../store/cart-context';
import { AnnouncementBar } from './AnnouncementBar';
import { BrandMark } from './BrandMark';
import { MobileNavigation } from './MobileNavigation';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-1 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-maroon ${
    isActive ? 'text-maroon' : 'text-ink/75 hover:text-maroon'
  }`;

export const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-beige/80 bg-canvas/95 backdrop-blur-lg">
      <AnnouncementBar />
      <div className="site-container flex h-20 items-center justify-between gap-4">
        <BrandMark />
        <nav aria-label="Main navigation" className="hidden items-center gap-6 lg:flex">
          <NavLink className={navClass} end to="/">
            Home
          </NavLink>
          <NavLink className={navClass} to="/products">
            Products
          </NavLink>
          <Link
            className="rounded-md px-1 py-2 text-sm font-semibold text-ink/75 hover:text-maroon focus-visible:outline focus-visible:outline-2 focus-visible:outline-maroon"
            to="/#categories"
          >
            Categories
          </Link>
          <a
            className="rounded-md px-1 py-2 text-sm font-semibold text-ink/75 hover:text-maroon focus-visible:outline focus-visible:outline-2 focus-visible:outline-maroon"
            href={env.instagramUrl}
            rel="noreferrer"
            target="_blank"
          >
            Instagram
          </a>
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <a
            aria-label="Visit Kshitija's Creations on Instagram"
            className="header-icon-button hidden sm:grid"
            href={env.instagramUrl}
            rel="noreferrer"
            target="_blank"
          >
            <Instagram aria-hidden="true" className="size-5" />
          </a>
          <Link
            aria-label={`Cart with ${itemCount} items`}
            className="header-icon-button relative"
            to="/cart"
          >
            <ShoppingBag aria-hidden="true" className="size-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-maroon px-1 text-[0.6rem] font-bold text-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
          <button
            aria-expanded={mobileOpen}
            aria-label="Open navigation menu"
            className="header-icon-button lg:hidden"
            onClick={() => setMobileOpen(true)}
            type="button"
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>
      <MobileNavigation isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
};
