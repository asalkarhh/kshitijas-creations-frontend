import { ChevronLeft, ChevronRight } from 'lucide-react';
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
      <div className="relative aspect-[4/5] sm:aspect-[16/6] lg:aspect-[16/5] min-h-[22rem] sm:min-h-[26rem] lg:min-h-[30rem] w-full overflow-hidden rounded-4xl bg-beige">
        <picture>
          {banner.mobileImageUrl && (
            <source media="(max-width: 639px)" srcSet={banner.mobileImageUrl} />
          )}
          <img
            alt={banner.imageAlt || banner.title}
            className={`absolute inset-0 h-full w-full object-cover ${
              activeIndex % 2 === 0 ? 'object-[64%_center]' : 'object-[75%_center]'
            }`}
            fetchPriority="high"
            key={banner.id}
            src={banner.desktopImageUrl}
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-canvas/95 via-canvas/80 to-transparent sm:from-canvas/90 sm:via-canvas/60 sm:to-transparent" />
        <div
          aria-live="polite"
          className="relative z-10 flex h-full max-w-2xl flex-col items-start justify-center p-6 sm:p-12 lg:p-16"
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-maroon/75 sm:mb-4">
            Handcrafted in small batches
          </p>
          <h1 className="max-w-xl font-display text-3xl leading-[1.1] text-ink sm:text-4xl lg:text-5xl">
            {banner.title}
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-ink/75 sm:mt-5 sm:text-base sm:leading-7 lg:text-lg">
            {banner.subtitle}
          </p>
          {banner.buttonText && hasSafeLink && (
            isExternalUrl(targetLink) ? (
              <a
                className="button-primary mt-6 sm:mt-8"
                href={targetLink}
                rel="noreferrer noopener"
                target="_blank"
              >
                {banner.buttonText}
              </a>
            ) : (
              <Link className="button-primary mt-6 sm:mt-8" to={targetLink}>
                {banner.buttonText}
              </Link>
            )
          )}
        </div>
        {banners.length > 1 && (
          <div className="absolute inset-x-5 bottom-5 z-20 flex items-center justify-between sm:inset-x-8 sm:bottom-8">
            <div className="flex gap-2" role="group" aria-label="Choose featured collection">
              {banners.map((item, index) => (
                <button
                  aria-label={`Show slide ${index + 1}: ${item.title}`}
                  aria-pressed={index === activeIndex}
                  className={`h-2.5 rounded-full transition-[width,background-color] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon motion-reduce:transition-none ${
                    index === activeIndex
                      ? 'w-8 bg-maroon'
                      : 'w-2.5 bg-maroon/35 hover:bg-maroon/60'
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

