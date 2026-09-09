import { Sparkles, Heart } from 'lucide-react';

export const AnnouncementBar = () => (
  <aside
    aria-label="Store announcement"
    className="relative z-50 bg-gradient-to-r from-maroon via-[#7B2034] to-maroon px-4 py-2 text-center text-xs font-medium tracking-wider text-white sm:text-xs"
  >
    <div className="site-container flex items-center justify-center gap-2 sm:gap-3">
      <Sparkles aria-hidden="true" className="size-3.5 animate-pulse text-gold" />
      <span className="font-sans">
        Handcrafted in small batches <span className="text-gold/80 font-serif mx-1">•</span> Personal WhatsApp confirmation <span className="text-gold/80 font-serif mx-1">•</span> Delivery across India
      </span>
      <Heart aria-hidden="true" className="hidden sm:inline-block size-3.5 fill-rose/40 text-rose" />
    </div>
  </aside>
);
