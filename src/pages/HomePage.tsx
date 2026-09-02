import {
  Gift,
  Heart,
  Instagram,
  MapPin,
  MessageCircleHeart,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { env } from '../app/config/env';
import { BannerCarousel } from '../components/banner/BannerCarousel';
import { SectionHeading } from '../components/common/SectionHeading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { CategoryCard } from '../components/product/CategoryCard';
import { FeaturedProductSection } from '../components/product/FeaturedProductSection';
import { CategorySkeleton } from '../components/product/CategorySkeleton';
import { ProductSkeleton } from '../components/product/ProductSkeleton';
import { usePageMetadata } from '../hooks/use-page-metadata';
import { useBanners } from '../hooks/use-banners';
import { useCategories } from '../hooks/use-categories';
import { useProducts } from '../hooks/use-products';
import { Skeleton } from '../components/common/Skeleton';

const orderingSteps = [
  { icon: Sparkles, label: 'Browse products', detail: 'Find a piece that feels just right.' },
  { icon: ShoppingBag, label: 'Add items to cart', detail: 'Keep your favourites together.' },
  { icon: MapPin, label: 'Enter delivery address', detail: 'Tell us where to send your order.' },
  {
    icon: MessageCircleHeart,
    label: 'Submit & send',
    detail: 'Confirm with a prepared WhatsApp message.',
  },
];

const HomePage = () => {
  usePageMetadata({
    title: 'Handmade jewellery & keepsakes',
    description: 'Discover thoughtful jewellery, gifts and keepsakes handcrafted in small batches.',
    canonicalPath: '/',
  });

  const { data: banners, isLoading: loadingBanners } = useBanners();
  const { data: categories, isLoading: loadingCategories, error: categoriesError, refetch: refetchCategories } = useCategories();
  
  const { data: featuredResponse, isLoading: loadingFeatured } = useProducts({ featured: true, page: 0, size: 8 });
  const { data: newResponse, isLoading: loadingNew } = useProducts({ sort: 'newest', page: 0, size: 8 });

  const activeCategories = (categories ?? [])
    .filter((c) => (c.isActive !== false && c.active !== false))
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  return (
    <>
      {loadingBanners ? (
        <section className="site-container pt-4 sm:pt-6">
          <Skeleton className="min-h-[22rem] sm:min-h-[26rem] lg:min-h-[30rem] rounded-4xl w-full" />
        </section>
      ) : banners && banners.length > 0 ? (
        <BannerCarousel banners={banners} />
      ) : null}


      <section className="section-space scroll-mt-32" id="categories">
        <div className="site-container">
          <SectionHeading
            align="center"
            description="Every collection begins at the worktable and is finished slowly, one detail at a time."
            eyebrow="Made to be treasured"
            title="Shop by collection"
          />
          {categoriesError ? (
            <div className="mt-9">
              <ErrorMessage message="Could not load categories" onRetry={refetchCategories} />
            </div>
          ) : (
            <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {loadingCategories ? (
                Array.from({ length: 3 }).map((_, i) => <CategorySkeleton key={i} />)
              ) : activeCategories.length === 0 ? (
                <div className="col-span-full py-12 text-center text-muted">No collections currently available.</div>
              ) : (
                activeCategories.map((category, index) => (
                  <CategoryCard category={category} index={index} key={category.id} />
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {loadingFeatured ? (
        <section className="section-space">
          <div className="site-container">
             <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
               <SectionHeading description="Small details, warm colours, and the pieces our customers reach for most." eyebrow="Customer favourites" title="Handmade, and much loved" />
             </div>
             <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-7">
               {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
             </div>
          </div>
        </section>
      ) : featuredResponse && featuredResponse.content.length > 0 ? (
        <FeaturedProductSection
          description="Small details, warm colours, and the pieces our customers reach for most."
          eyebrow="Customer favourites"
          products={featuredResponse.content}
          title="Handmade, and much loved"
        />
      ) : null}

      {loadingNew ? (
        <section className="section-space">
          <div className="site-container">
             <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
               <SectionHeading description="New ideas are added in tiny batches—once they are gone, they may not return exactly the same." eyebrow="Just arrived" title="Fresh from the worktable" />
             </div>
             <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-7">
               {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
             </div>
          </div>
        </section>
      ) : newResponse && newResponse.content.length > 0 ? (
        <FeaturedProductSection
          description="New ideas are added in tiny batches—once they are gone, they may not return exactly the same."
          eyebrow="Just arrived"
          products={newResponse.content}
          title="Fresh from the worktable"
        />
      ) : null}

      <section className="section-space">
        <div className="site-container grid overflow-hidden rounded-4xl bg-maroon text-white lg:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose">
              From our studio
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              See the making, not just the make
            </h2>
            <p className="mt-4 max-w-lg leading-7 text-white/75">
              Follow along for worktable moments, new drops, styling ideas and the little stories
              behind every piece.
            </p>
            <a
              className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-maroon hover:bg-rose focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              href={env.instagramUrl}
              rel="noreferrer noopener"
              target="_blank"
            >
              <Instagram aria-hidden="true" className="size-5" /> Visit our Instagram
            </a>
          </div>
          <div className="grid min-h-64 place-items-center bg-[radial-gradient(circle_at_30%_20%,rgba(233,192,196,0.34),transparent_32%),radial-gradient(circle_at_70%_75%,rgba(201,164,91,0.28),transparent_38%)] p-10">
            <div className="relative grid size-48 place-items-center rounded-full border border-white/20 sm:size-56">
              <div className="absolute inset-4 rounded-full border border-white/10" />
              <Instagram aria-hidden="true" className="size-16 text-rose" strokeWidth={1.2} />
            </div>
          </div>
        </div>
      </section>

      <section className="section-space bg-rose/20">
        <div className="site-container grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="relative mx-auto grid aspect-square w-full max-w-md place-items-center rounded-[45%_55%_52%_48%/55%_45%_55%_45%] bg-beige/75">
            <div className="grid size-40 place-items-center rounded-full bg-surface shadow-soft sm:size-48">
              <Heart
                aria-hidden="true"
                className="size-16 text-maroon"
                fill="rgb(var(--color-rose))"
                strokeWidth={1.2}
              />
            </div>
            <Sparkles aria-hidden="true" className="absolute right-12 top-12 size-7 text-gold" />
            <Gift aria-hidden="true" className="absolute bottom-12 left-12 size-8 text-maroon/45" />
          </div>
          <div>
            <SectionHeading
              description="Kshitija’s Creations is built around the joy of making something slowly and choosing something personally. Small-batch work lets every piece keep its warmth, texture and individuality."
              eyebrow="Our story"
              title="Handmade with love, for everyday moments"
            />
            <p className="mt-5 leading-7 text-muted">
              Slight variations are part of the charm. They are a gentle reminder that your piece
              passed through real hands, not an assembly line.
            </p>
            <Link className="button-secondary mt-7" to="/products">
              Find your piece
            </Link>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="site-container">
          <SectionHeading
            align="center"
            description="A simple, personal ordering experience—no account or online payment needed."
            eyebrow="How to order"
            title="From our hands to your home"
          />
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {orderingSteps.map((step, index) => (
              <li
                className="rounded-3xl border border-beige bg-surface p-6 shadow-soft"
                key={step.label}
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-full bg-rose/40 text-maroon">
                    <step.icon aria-hidden="true" className="size-5" />
                  </span>
                  <span className="font-display text-2xl text-gold">0{index + 1}</span>
                </div>
                <h3 className="mt-5 font-display text-xl text-ink">{step.label}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{step.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
};

export default HomePage;
