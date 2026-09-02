export const AvailabilityBadge = ({ isAvailable }: { isAvailable: boolean }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
      isAvailable ? 'bg-[#e8f2e9] text-[#285c37]' : 'bg-rose/40 text-maroon'
    }`}
  >
    <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
    {isAvailable ? 'Available' : 'Currently unavailable'}
  </span>
);
