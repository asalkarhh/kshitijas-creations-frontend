import { Skeleton } from '../common/Skeleton';

export const CategorySkeleton = () => (
  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl">
    <Skeleton className="absolute inset-0" />
    <div className="absolute inset-x-0 bottom-0 p-5">
      <Skeleton className="h-8 w-2/3 rounded" />
      <Skeleton className="mt-2 h-4 w-1/3 rounded" />
    </div>
  </div>
);

