import { Sparkles } from 'lucide-react';

export const AnnouncementBar = () => (
  <div className="bg-maroon px-4 py-2.5 text-center text-xs font-medium tracking-wide text-white sm:text-sm">
    <p className="flex items-center justify-center gap-2">
      <Sparkles aria-hidden="true" className="size-3.5 text-gold" />
      Handmade in small batches · Orders confirmed personally
    </p>
  </div>
);
