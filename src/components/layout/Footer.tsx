import { Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { env } from '../../app/config/env';
import { BrandMark } from './BrandMark';

export const Footer = () => (
  <footer className="mt-auto border-t border-beige bg-surface">
    <div className="site-container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] lg:py-16">
      <div>
        <BrandMark />
        <p className="mt-5 max-w-sm text-sm leading-6 text-muted">
          Jewellery, gifts and keepsakes thoughtfully handcrafted in small batches, with love in
          every detail.
        </p>
        <a
          className="mt-5 inline-flex items-center gap-2 rounded font-semibold text-maroon hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-maroon"
          href={env.instagramUrl}
          rel="noreferrer"
          target="_blank"
        >
          <Instagram aria-hidden="true" className="size-4" /> Follow on Instagram
        </a>
      </div>
      <div>
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-ink">Explore</h2>
        <ul className="mt-4 space-y-3 text-sm text-muted">
          <li>
            <Link className="hover:text-maroon" to="/products">
              All products
            </Link>
          </li>
          <li>
            <Link className="hover:text-maroon" to="/products?category=earrings">
              Earrings
            </Link>
          </li>
          <li>
            <Link className="hover:text-maroon" to="/products?category=bracelets">
              Bracelets
            </Link>
          </li>
          <li>
            <Link className="hover:text-maroon" to="/products?category=keepsakes">
              Keepsakes
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-ink">Information</h2>
        <ul className="mt-4 space-y-3 text-sm text-muted">
          <li>
            <Link className="hover:text-maroon" to="/privacy">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link className="hover:text-maroon" to="/terms">
              Terms
            </Link>
          </li>
          <li>
            <Link className="hover:text-maroon" to="/cart">
              Your cart
            </Link>
          </li>
        </ul>
      </div>
    </div>
    <div className="border-t border-beige/80 py-5 text-center text-xs text-muted">
      © {new Date().getFullYear()} Kshitija’s Creations. Made with care.
    </div>
  </footer>
);
