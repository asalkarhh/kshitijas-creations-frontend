import { Link } from 'react-router-dom';

export const BrandMark = ({ onClick }: { onClick?: () => void }) => (
  <Link
    aria-label="Kshitija's Creations home"
    className="group inline-flex items-center gap-2 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-maroon"
    onClick={onClick}
    to="/"
  >
    <span
      aria-hidden="true"
      className="grid size-9 place-items-center rounded-full border border-gold/70 bg-rose/25 font-display text-xl italic text-maroon"
    >
      K
    </span>
    <span className="leading-none">
      <span className="block font-display text-xl text-ink sm:text-2xl">Kshitija’s</span>
      <span className="mt-1 block text-[0.58rem] font-bold uppercase tracking-[0.24em] text-maroon/75">
        Creations
      </span>
    </span>
  </Link>
);
