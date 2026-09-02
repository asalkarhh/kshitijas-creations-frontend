export const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded bg-muted/20 ${className || ''}`} />
);

