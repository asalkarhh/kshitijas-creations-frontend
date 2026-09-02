import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { resolveMediaUrl } from '../../utils/media';

interface ProductMediaProps {
  src?: string;
  alt: string;
  className?: string;
  eager?: boolean;
}

export const ProductMedia = ({ src, alt, className = '', eager = false }: ProductMediaProps) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        role="img"
        aria-label={alt || 'Image not available'}
        className={`flex h-full w-full items-center justify-center bg-rose/10 text-maroon/40 ${className}`}
      >
        <ImageOff aria-hidden="true" className="size-8" />
      </div>
    );
  }

  return (
    <img
      alt={alt}
      className={`h-full w-full object-cover ${className}`}
      decoding="async"
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setHasError(true)}
      src={resolveMediaUrl(src)}
    />
  );
};

