import { Sparkles } from 'lucide-react';
import brandLogo from '../../assets/kshitija creation.jpg';

export interface PagePreloaderProps {
  label?: string;
  themeLine?: string;
  fullscreen?: boolean;
}

export const PagePreloader = ({
  label = 'Loading Kshitija’s Creations',
  themeLine = 'Handcrafted jewellery & celebratory keepsakes, made with love',
  fullscreen = true,
}: PagePreloaderProps) => {
  return (
    <div
      aria-label={label}
      aria-live="polite"
      className={`${
        fullscreen
          ? 'fixed inset-0 z-50 flex items-center justify-center bg-canvas/95 backdrop-blur-md transition-all duration-300'
          : 'flex min-h-[50vh] w-full flex-col items-center justify-center py-16'
      }`}
      role="status"
    >
      <div className="flex flex-col items-center text-center px-4 max-w-md animate-fadeInPreload">
        {/* Animated Brand Round Circle */}
        <div className="relative grid place-items-center size-28 sm:size-32">
          {/* Ambient Golden & Rose Glow */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-rose via-gold/25 to-maroon/20 blur-xl opacity-80 animate-pulse-glow" />

          {/* Outer Rotating Dashed Gold Ring */}
          <div
            className="absolute inset-0 rounded-full border-2 border-dashed border-gold/60 animate-spin"
            style={{ animationDuration: '9s' }}
          />

          {/* Luxury Orbital Spinner Accent Ring */}
          <div
            className="absolute -inset-1.5 rounded-full border-2 border-transparent border-t-maroon border-r-gold/90 animate-spin"
            style={{ animationDuration: '1.4s' }}
          />

          {/* Inner Brand Logo Circular Frame */}
          <div className="relative size-24 sm:size-28 rounded-full overflow-hidden border-2 border-gold/70 bg-white shadow-card ring-4 ring-rose/50">
            <img
              alt="Kshitija's Creations"
              className="size-full object-cover rounded-full select-none"
              decoding="async"
              loading="eager"
              src={brandLogo}
            />
          </div>
        </div>

        {/* Brand Display Title */}
        <div className="mt-5 flex flex-col items-center leading-tight">
          <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-ink">
            Kshitija’s Creations
          </span>
          <span className="text-[0.62rem] font-bold uppercase tracking-[0.28em] text-maroon/80 font-sans mt-0.5">
            Handmade Studio
          </span>
        </div>

        {/* Animated Luxury Loading Bar */}
        <div className="mt-4 w-44 sm:w-52 h-1 rounded-full bg-beige/80 overflow-hidden relative shadow-inner">
          <div className="animate-preload-glide inset-y-0 h-full rounded-full bg-gradient-to-r from-gold via-maroon to-gold" />
        </div>

        {/* Thematic One-Liner */}
        <div className="mt-3.5 flex items-center justify-center gap-1.5 text-center">
          <Sparkles className="size-3 text-gold shrink-0 animate-pulse" />
          <p className="font-serif text-xs sm:text-sm italic text-muted tracking-wide max-w-xs">
            {themeLine}
          </p>
          <Sparkles className="size-3 text-gold shrink-0 animate-pulse" />
        </div>

        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
};

