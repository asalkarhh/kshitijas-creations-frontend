export const AvailabilityBadge = ({ isAvailable }: { isAvailable: boolean }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold tracking-wide ${
      isAvailable
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs'
        : 'bg-rose/40 text-maroon/80 border border-maroon/20'
    }`}
  >
    <span
      aria-hidden="true"
      className={`size-1.5 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-maroon/60'}`}
    />
    {isAvailable ? 'Available' : 'Currently unavailable'}
  </span>
);
