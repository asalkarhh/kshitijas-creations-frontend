import { Instagram, Menu, ShoppingBag, User } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { env } from '../../app/config/env';
import { useCart } from '../../store/cart-context';
import { AnnouncementBar } from './AnnouncementBar';
import { BrandMark } from './BrandMark';
import { MobileNavigation } from './MobileNavigation';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `relative px-3.5 py-2 text-sm font-semibold tracking-wide transition-all duration-200 rounded-full ${
    isActive
      ? 'text-maroon bg-rose/60 shadow-xs font-bold'
      : 'text-ink/80 hover:text-maroon hover:bg-rose/30'
  }`;

export const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-beige/60 bg-canvas/90 backdrop-blur-xl shadow-xs transition-all duration-200">
      <AnnouncementBar />
      <div className="site-container flex h-20 items-center justify-between gap-4">
        <BrandMark />
        <nav aria-label="Main navigation" className="hidden items-center gap-1.5 lg:flex">
          <NavLink className={navClass} end to="/">
            Home
          </NavLink>
          <NavLink className={navClass} to="/products">
            Products
          </NavLink>
          <NavLink className={navClass} to="/categories">
            Categories
          </NavLink>
          {/* <a
            className="px-3.5 py-2 text-sm font-semibold tracking-wide text-ink/80 transition-all duration-200 hover:bg-rose/30 hover:text-maroon rounded-full inline-flex items-center gap-1.5"
            href={env.instagramUrl}
            rel="noreferrer"
            target="_blank"
          >
            <span>Instagram</span>
          </a> */}
          {/* <NavLink className={navClass} to="/admin/login">
            Admin
          </NavLink> */}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            aria-label="Visit Kshitija's Creations on Instagram"
            className="header-icon-button hidden sm:grid border border-beige/60 bg-surface/80 shadow-xs hover:border-gold/50"
            href={env.instagramUrl}
            rel="noreferrer"
            target="_blank"
          >
            <Instagram aria-hidden="true" className="size-4.5 text-maroon" />
          </a>
          <Link
            aria-label="Admin Portal"
            className="header-icon-button border border-beige/60 bg-surface/80 shadow-xs hover:border-maroon/40"
            title="Admin Login"
            to="/admin/login"
          >
            <User aria-hidden="true" className="size-4.5 text-maroon" />
          </Link>
          <Link
            aria-label={`Cart with ${itemCount} items`}
            className="header-icon-button relative border border-beige/60 bg-surface/80 shadow-xs hover:border-maroon/40"
            to="/cart"
          >
            <ShoppingBag aria-hidden="true" className="size-4.5 text-maroon" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-maroon px-1 text-[0.65rem] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
          <button
            aria-expanded={mobileOpen}
            aria-label="Open navigation menu"
            className="header-icon-button border border-beige/60 bg-surface/80 lg:hidden"
            onClick={() => setMobileOpen(true)}
            type="button"
          >
            <Menu aria-hidden="true" className="size-5 text-ink" />
          </button>
        </div>
      </div>
      <MobileNavigation isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
};

