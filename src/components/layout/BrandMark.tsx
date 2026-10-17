import { Link } from 'react-router-dom';
import brandLogo from '../../assets/kshitija creation.jpg';
import { scrollToTop } from '../../utils/scrollToTop';

interface BrandMarkProps {
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandMark = ({ onClick, className = '', size = 'md' }: BrandMarkProps) => {
  const sizeClasses = {
    sm: {
      image: 'size-9',
      title: 'text-lg sm:text-xl',
      subtitle: 'text-[0.58rem]',
    },
    md: {
      image: 'size-10 sm:size-11',
      title: 'text-xl sm:text-2xl',
      subtitle: 'text-[0.62rem]',
    },
    lg: {
      image: 'size-14 sm:size-16',
      title: 'text-2xl sm:text-3xl',
      subtitle: 'text-xs',
    },
  }[size];

  return (
    <Link
      aria-label="Kshitija's Creations home"
      className={`group inline-flex items-center gap-3 rounded-xl transition-transform duration-200 hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-maroon ${className}`}
      onClick={(event) => {
        onClick?.();
        // Keep the logo useful even when the user is already on the home route.
        if (window.location.pathname === '/') {
          event.preventDefault();
          scrollToTop();
        }
      }}
      to="/"
    >
      <div
        className={`relative ${sizeClasses.image} shrink-0 overflow-hidden rounded-full border border-gold/60 bg-white shadow-sm ring-1 ring-gold/20 transition-all duration-300 group-hover:border-gold group-hover:shadow-glow`}
      >
        <img
          alt="Kshitija's Creations logo"
          className="size-full object-cover rounded-full"
          loading="eager"
          src={brandLogo}
        />
      </div>
      <div className="flex flex-col leading-tight">
        <span
          className={`font-display ${sizeClasses.title} font-bold tracking-tight text-ink transition-colors group-hover:text-maroon`}
        >
          Kshitija’s
        </span>
        <span
          className={`${sizeClasses.subtitle} font-bold uppercase tracking-[0.26em] text-maroon/80 font-sans`}
        >
          Creations
        </span>
      </div>
    </Link>
  );
};

