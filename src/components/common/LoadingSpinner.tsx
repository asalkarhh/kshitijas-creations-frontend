export const LoadingSpinner = ({ label = 'Loading' }: { label?: string }) => (
  <div className="flex items-center justify-center gap-3 py-12" role="status">
    <span className="size-6 animate-spin rounded-full border-2 border-rose border-t-maroon motion-reduce:animate-none" />
    <span className="sr-only">{label}</span>
  </div>
);
