import { Instagram, Sparkles, Heart, ShieldCheck, Truck, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { env } from '../../app/config/env';
import { BrandMark } from './BrandMark';

export const Footer = () => (
  <footer className="mt-auto border-t border-beige/80 bg-gradient-to-b from-surface via-surface to-canvas">
    {/* Trust Badges Bar */}
    <div className="border-b border-beige/60 bg-rose/20 py-6">
      <div className="site-container grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-maroon shadow-xs border border-beige/60">
            <Sparkles className="size-5 text-gold" />
          </div>
          <div>
            <p className="text-xs font-bold text-ink font-sans">100% Handcrafted</p>
            <p className="text-[0.7rem] text-muted">Original artisan pieces</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-maroon shadow-xs border border-beige/60">
            <ShieldCheck className="size-5 text-maroon" />
          </div>
          <div>
            <p className="text-xs font-bold text-ink font-sans">Verified Quality</p>
            <p className="text-[0.7rem] text-muted">Premium brass & pearls</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-maroon shadow-xs border border-beige/60">
            <Truck className="size-5 text-maroon" />
          </div>
          <div>
            <p className="text-xs font-bold text-ink font-sans">Pan-India Delivery</p>
            <p className="text-[0.7rem] text-muted">Carefully bubble-wrapped</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#25D366] shadow-xs border border-beige/60">
            <MessageCircle className="size-5 text-[#25D366]" />
          </div>
          <div>
            <p className="text-xs font-bold text-ink font-sans">WhatsApp Ordering</p>
            <p className="text-[0.7rem] text-muted">Instant direct chat</p>
          </div>
        </div>
      </div>
    </div>

    <div className="site-container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] lg:py-16">
      <div>
        <BrandMark />
        <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
          Thoughtfully handcrafted jewellery, celebratory keepsakes, and festive gifts made in small batches with love, care, and individual attention in every detail.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <a
            aria-label="Visit Kshitija's Creations on Instagram"
            className="inline-flex items-center gap-2 rounded-full border border-beige/80 bg-surface px-4 py-2 text-xs font-bold text-maroon shadow-xs transition-all hover:border-gold hover:shadow-sm"
            href={env.instagramUrl}
            rel="noreferrer"
            target="_blank"
          >
            <Instagram aria-hidden="true" className="size-4" /> Follow @kshitijas_creations
          </a>
        </div>
      </div>
      <div>
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-maroon font-sans">Curated Collections</h2>
        <ul className="mt-4 space-y-2.5 text-sm text-muted font-sans">
          <li>
            <Link className="transition-colors hover:text-maroon" to="/products">
              All Creations
            </Link>
          </li>
          <li>
            <Link className="transition-colors hover:text-maroon" to="/products?category=earrings">
              Handcrafted Earrings
            </Link>
          </li>
          <li>
            <Link className="transition-colors hover:text-maroon" to="/products?category=necklaces">
              Chokers & Necklaces
            </Link>
          </li>
          <li>
            <Link className="transition-colors hover:text-maroon" to="/products?category=bracelets">
              Bracelets & Bangles
            </Link>
          </li>
          <li>
            <Link className="transition-colors hover:text-maroon" to="/products?category=keepsakes">
              Festive Keepsakes & Gifts
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-maroon font-sans">Customer Care</h2>
        <ul className="mt-4 space-y-2.5 text-sm text-muted font-sans">
          <li>
            <Link className="transition-colors hover:text-maroon" to="/cart">
              Shopping Bag
            </Link>
          </li>
          <li>
            <Link className="transition-colors hover:text-maroon" to="/privacy">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link className="transition-colors hover:text-maroon" to="/terms">
              Terms & Conditions
            </Link>
          </li>
          <li>
            <a
              className="inline-flex items-center gap-1.5 transition-colors hover:text-maroon"
              href={env.instagramUrl}
              rel="noreferrer"
              target="_blank"
            >
              Custom Order Inquiry
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div className="border-t border-beige/70 py-6 text-xs text-muted font-sans">
      <div className="site-container flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
        <p>© {new Date().getFullYear()} Kshitija’s Creations. Handcrafted in India.</p>
        <p className="flex items-center justify-center gap-1 text-xs font-medium sm:text-center">
          Made with <Heart className="size-3 fill-maroon text-maroon inline" /> for thoughtful gifting
        </p>
        <p className="text-xs">
          Developed by{' '}
          <a
            className="font-bold text-maroon hover:underline"
            href="https://asalkar.in"
            rel="noreferrer"
            target="_blank"
          >
            Asalkar Techworks Pvt. Ltd.
          </a>
        </p>
      </div>
    </div>
  </footer>
);
