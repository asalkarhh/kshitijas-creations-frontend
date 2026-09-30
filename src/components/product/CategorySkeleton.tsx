import { Skeleton } from '../common/Skeleton';

export const CategorySkeleton = () => (
  <div className="flex flex-col items-center shrink-0 w-32 sm:w-40 text-center">
    <Skeleton className="size-28 sm:size-36 rounded-full" />
    <Skeleton className="mt-3.5 h-4 w-20 rounded-full" />
  </div>
);
