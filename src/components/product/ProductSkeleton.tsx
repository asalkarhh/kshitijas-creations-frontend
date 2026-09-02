import { Skeleton } from '../common/Skeleton';

export const ProductSkeleton = () => (
  <article className="min-w-0">
    <Skeleton className="aspect-[4/5] w-full rounded-3xl" />
    <div className="pt-4">
      <Skeleton className="h-5 w-20 rounded-full" />
      <Skeleton className="mt-2 h-6 w-3/4" />
      <Skeleton className="mt-1 h-5 w-1/4" />
      <div className="mt-3 flex gap-2">
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="size-10 rounded-full" />
      </div>
    </div>
  </article>
);

