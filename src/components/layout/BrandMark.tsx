import { Link } from 'react-router-dom';

export const BrandMark = ({ onClick }: { onClick?: () => void }) => (
  <Link
    aria-label="Kshitija's Creations home"
    className="group inline-flex items-center gap-3 rounded-xl transition-transform duration-200 hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-maroon"
    onClick={onClick}
    to="/"
  >
    <div
      aria-hidden="true"
      className="relative grid size-10 place-items-center rounded-full border border-gold/60 bg-gradient-to-br from-rose via-white to-beige shadow-sm transition-all duration-300 group-hover:border-gold group-hover:shadow-glow"
    >
      <span className="font-serif text-2xl font-semibold italic text-maroon">K</span>
      <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-gold ring-2 ring-white" />
    </div>
    <div className="flex flex-col leading-tight">
      <span className="font-display text-xl font-bold tracking-tight text-ink transition-colors group-hover:text-maroon sm:text-2xl">
        Kshitija’s
      </span>
      <span className="text-[0.62rem] font-bold uppercase tracking-[0.26em] text-maroon/80 font-sans">
        Creations
      </span>
    </div>
  </Link>
);
