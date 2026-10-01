import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect, useCallback } from 'react';
import type { Product } from '../../types';
import { ProductCard } from './ProductCard';

interface ProductScrollRowProps {
  products: Product[];
}

export const ProductScrollRow = ({ products }: ProductScrollRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Mouse Drag-to-Scroll Ref & State
  const [isDragging, setIsDragging] = useState(false);
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  }, []);

  useEffect(() => {
    checkScroll();
    const currentRef = scrollRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      }
    };
  }, [products, checkScroll]);

  // Attach global mousemove & mouseup listeners for uninterrupted viewport-wide dragging
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!isMouseDownRef.current || !scrollRef.current) return;
      const x = e.clientX;
      const walk = (x - startXRef.current) * 1.5;
      if (Math.abs(walk) > 4) {
        hasMovedRef.current = true;
      }
      scrollRef.current.scrollLeft = startScrollLeftRef.current - walk;
    };

    const handleWindowMouseUp = () => {
      if (isMouseDownRef.current) {
        isMouseDownRef.current = false;
        setIsDragging(false);
        setTimeout(() => {
          hasMovedRef.current = false;
        }, 50);
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    if (e.button !== 0) return; // Only main left mouse button

    isMouseDownRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.clientX;
    startScrollLeftRef.current = scrollRef.current.scrollLeft;
    setIsDragging(true);
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const scrollByStep = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const step = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -step : step,
        behavior: 'smooth',
      });
    }
  };

  if (products.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted italic">
        New handcrafted items coming soon to this collection!
      </p>
    );
  }

  return (
    <div className="relative group/row">
      {/* Scroll Left Button (Desktop) */}
      {canScrollLeft && (
        <button
          aria-label="Scroll products left"
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 hidden sm:grid size-10 place-items-center rounded-full border border-beige/90 bg-surface/95 text-ink shadow-md transition-all hover:bg-maroon hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-maroon"
          onClick={() => scrollByStep('left')}
          type="button"
        >
          <ChevronLeft className="size-5" />
        </button>
      )}

      {/* Horizontal Scroll Track with Native Drag-to-Scroll & Drag Cancellation */}
      <div
        ref={scrollRef}
        className={`flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 touch-pan-x select-none cursor-grab ${
          isDragging ? 'cursor-grabbing !snap-none !scroll-auto' : 'snap-x snap-mandatory scroll-smooth'
        }`}
        onClickCapture={handleClickCapture}
        onDragStart={(e) => e.preventDefault()}
        onMouseDown={handleMouseDown}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[220px] xs:w-[250px] sm:w-[270px] lg:w-[280px] shrink-0 snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Scroll Right Button (Desktop) */}
      {canScrollRight && (
        <button
          aria-label="Scroll products right"
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 hidden sm:grid size-10 place-items-center rounded-full border border-beige/90 bg-surface/95 text-ink shadow-md transition-all hover:bg-maroon hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-maroon"
          onClick={() => scrollByStep('right')}
          type="button"
        >
          <ChevronRight className="size-5" />
        </button>
      )}
    </div>
  );
};

