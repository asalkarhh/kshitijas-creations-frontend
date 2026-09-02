import { RotateCcw } from 'lucide-react';
import { Button } from './Button';

export const ErrorMessage = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="rounded-3xl border border-maroon/15 bg-rose/20 p-6 text-center" role="alert">
    <p className="font-medium text-ink">{message}</p>
    {onRetry && (
      <Button className="mt-4" onClick={onRetry} variant="secondary">
        <RotateCcw aria-hidden="true" className="size-4" /> Retry
      </Button>
    )}
  </div>
);
