export const ProductCardSkeleton = () => (
  <div
    aria-label="Loading product"
    className="animate-pulse motion-reduce:animate-none"
    role="status"
  >
    <div className="aspect-[4/5] rounded-3xl bg-beige/70" />
    <div className="mt-4 h-3 w-24 rounded bg-beige" />
    <div className="mt-3 h-5 w-4/5 rounded bg-beige" />
    <div className="mt-3 h-4 w-20 rounded bg-beige" />
  </div>
);
