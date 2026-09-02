import { useState, useEffect, useRef } from 'react';
import type { KeyboardEvent, TouchEvent } from 'react';
import type { ProductMedia as ProductMediaType } from '../../types';
import { ProductMedia } from './ProductMedia';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ProductGalleryProps {
  media: ProductMediaType[];
  productName: string;
}

export const ProductGallery = ({ media, productName }: ProductGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  if (!media || media.length === 0) {
    return (
      <div className="aspect-[4/5] w-full rounded-4xl bg-beige flex items-center justify-center">
        <span className="text-muted">No image available</span>
      </div>
    );
  }

  const activeMedia = media[activeIndex];

  const handleNext = () => setActiveIndex((i) => (i + 1) % media.length);
  const handlePrev = () => setActiveIndex((i) => (i - 1 + media.length) % media.length);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  const renderMedia = (m: ProductMediaType, isModal = false) => {
    const isVideo = m.url.endsWith('.mp4') || m.url.endsWith('.webm');
    if (isVideo) {
      return (
        <video
          src={m.url}
          controls
          className="h-full w-full object-contain bg-black"
          playsInline
          autoPlay={false}
          preload="metadata"
          aria-label={m.altText || `${productName} video`}
        />
      );
    }
    return (
      <ProductMedia
        alt={m.altText || `${productName} image`}
        className={isModal ? 'object-contain' : 'object-cover'}
        src={m.url}
      />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div
        className="relative aspect-[4/5] w-full overflow-hidden rounded-4xl bg-beige shadow-card cursor-zoom-in"
        onClick={() => setIsFullscreen(true)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="button"
        tabIndex={0}
        aria-label="Enlarge media view"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsFullscreen(true);
          }
        }}
      >
        {renderMedia(activeMedia)}
        
        {media.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-ink shadow backdrop-blur hover:bg-white focus:outline-none focus:ring-2 focus:ring-maroon"
              aria-label="Previous image"
              type="button"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-ink shadow backdrop-blur hover:bg-white focus:outline-none focus:ring-2 focus:ring-maroon"
              aria-label="Next image"
              type="button"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {media.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => setActiveIndex(idx)}
              className={`relative aspect-square w-20 shrink-0 snap-start overflow-hidden rounded-xl border-2 transition-all ${
                idx === activeIndex ? 'border-maroon opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              aria-label={`View image ${idx + 1}`}
              aria-pressed={idx === activeIndex}
              type="button"
            >
              {m.url.endsWith('.mp4') || m.url.endsWith('.webm') ? (
                <div className="h-full w-full bg-black flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">Video</span>
                </div>
              ) : (
                <ProductMedia
                  alt={m.altText || ''}
                  className="object-cover"
                  src={m.url}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 sm:p-8"
          onKeyDown={handleKeyDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-label="Full size media view"
          tabIndex={0}
          autoFocus
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus:outline-none"
            aria-label="Close fullscreen"
            type="button"
          >
            <X className="size-6" />
          </button>
          
          <div className="relative h-full max-h-screen w-full max-w-5xl flex items-center justify-center">
            {renderMedia(activeMedia, true)}
            
            {media.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 focus:outline-none"
                  aria-label="Previous media"
                  type="button"
                >
                  <ChevronLeft className="size-8" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 focus:outline-none"
                  aria-label="Next media"
                  type="button"
                >
                  <ChevronRight className="size-8" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


