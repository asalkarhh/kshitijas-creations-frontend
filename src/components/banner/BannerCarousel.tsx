import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from '../../hooks/use-reduced-motion';
import type { Banner } from '../../types';
import { isExternalUrl, isSafeUrl } from '../../utils/url';

interface BannerCarouselProps {
  banners: Banner[];
  intervalMs?: number;
}

export const BannerCarousel = ({ banners, intervalMs = 6000 }: BannerCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();

  const show = (index: number) => {
    setActiveIndex((index + banners.length) % banners.length);
  };

  useEffect(() => {
    if (reducedMotion || paused || banners.length < 2) return;
    const timer = window.setInterval(
      () => setActiveIndex((current) => (current + 1) % banners.length),
      intervalMs,
    );
    return () => window.clearInterval(timer);
  }, [banners.length, intervalMs, paused, reducedMotion]);

  if (!banners || banners.length === 0) return null;
  const banner = banners[activeIndex];
  const targetLink = banner.targetUrl || banner.targetLink;
  const hasSafeLink = targetLink && isSafeUrl(targetLink);

  return (
    <section
      aria-label="Featured collections"
      aria-roledescription="carousel"
      className="site-container pt-4 sm:pt-6"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      onFocus={() => setPaused(true)}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') show(activeIndex - 1);
        if (event.key === 'ArrowRight') show(activeIndex + 1);
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      tabIndex={0}
    >
      <div className="relative aspect-[4/5] sm:aspect-[16/6] lg:aspect-[16/5.2] min-h-[24rem] sm:min-h-[28rem] lg:min-h-[32rem] w-full overflow-hidden rounded-5xl bg-beige/60 shadow-float border border-white/80">
        <picture>
          {banner.mobileImageUrl && (
            <source media="(max-width: 639px)" srcSet={banner.mobileImageUrl} />
          )}
          <img
            alt={banner.imageAlt || banner.title}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-out ${
              activeIndex % 2 === 0 ? 'object-[64%_center]' : 'object-[75%_center]'
            }`}
            fetchPriority="high"
            key={banner.id}
            src={banner.desktopImageUrl}
          />
        </picture>
        
        {/* Soft luxury ambient gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-canvas/98 via-canvas/85 to-transparent sm:from-canvas/95 sm:via-canvas/60 sm:to-transparent" />
        
        {/* Content Box */}
        <div
          aria-live="polite"
          className="relative z-10 flex h-full max-w-2xl flex-col items-start justify-center p-6 sm:p-12 lg:p-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-surface/80 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.2em] text-maroon shadow-2xs backdrop-blur-md">
            <Sparkles className="size-3 text-gold" />
            <span>Handcrafted in small batches</span>
          </div>

          <h1 className="mt-4 max-w-xl font-display text-3xl font-extrabold leading-[1.1] text-ink sm:text-5xl lg:text-6xl">
            {banner.title}
          </h1>

          {banner.subtitle && (
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted sm:mt-5 sm:text-base sm:leading-relaxed lg:text-lg font-sans">
              {banner.subtitle}
            </p>
          )}

          {banner.buttonText && hasSafeLink && (
            isExternalUrl(targetLink) ? (
              <a
                className="button-primary mt-6 sm:mt-8 shadow-md hover:shadow-lg"
                href={targetLink}
                rel="noreferrer noopener"
                target="_blank"
              >
                {banner.buttonText}
              </a>
            ) : (
              <Link className="button-primary mt-6 sm:mt-8 shadow-md hover:shadow-lg" to={targetLink}>
                {banner.buttonText}
              </Link>
            )
          )}
        </div>

        {/* Navigation Controls */}
        {banners.length > 1 && (
          <div className="absolute inset-x-5 bottom-5 z-20 flex items-center justify-between sm:inset-x-8 sm:bottom-8">
            <div className="flex items-center gap-2 rounded-full bg-white/60 p-1.5 backdrop-blur-md border border-white/60 shadow-xs" role="group" aria-label="Choose featured collection">
              {banners.map((item, index) => (
                <button
                  aria-label={`Show slide ${index + 1}: ${item.title}`}
                  aria-pressed={index === activeIndex}
                  className={`h-2 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-maroon ${
                    index === activeIndex
                      ? 'w-7 bg-maroon'
                      : 'w-2 bg-maroon/30 hover:bg-maroon/60'
                  }`}
                  key={item.id}
                  onClick={() => show(index)}
                  type="button"
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                aria-label="Previous slide"
                className="carousel-button"
                onClick={() => show(activeIndex - 1)}
                type="button"
              >
                <ChevronLeft aria-hidden="true" className="size-5" />
              </button>
              <button
                aria-label="Next slide"
                className="carousel-button"
                onClick={() => show(activeIndex + 1)}
                type="button"
              >
                <ChevronRight aria-hidden="true" className="size-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
