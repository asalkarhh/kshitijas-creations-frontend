import {
  Gift,
  Heart,
  Instagram,
  MapPin,
  MessageCircleHeart,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Truck,
  ArrowRight,
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
import kshitijaCreationImg from '../assets/kshitija creation.jpg';
import type { Product } from '../types';

const orderingSteps = [
  { icon: Sparkles, label: 'Browse Collections', detail: 'Discover unique handcrafted pieces made in tiny batches.' },
  { icon: ShoppingBag, label: 'Add to Bag', detail: 'Select your favourite earrings, chokers, or gift keepsakes.' },
  { icon: MapPin, label: 'Delivery Details', detail: 'Enter your address for fast, secure delivery across India.' },
  {
    icon: MessageCircleHeart,
    label: 'WhatsApp Confirm',
    detail: 'Complete your order with a pre-filled instant WhatsApp chat.',
  },
];

const highlights = [
  { icon: Sparkles, title: '100% Handcrafted', desc: 'Made slowly by hand' },
  { icon: ShieldCheck, title: 'Artisan Materials', desc: 'Skin-friendly brass & beads' },
  { icon: Truck, title: 'Safe Delivery', desc: 'Bubble-wrapped across India' },
  { icon: MessageCircleHeart, title: 'Direct WhatsApp', desc: 'Personal artisan support' },
];

const HomePage = () => {
  usePageMetadata({
    title: 'Handcrafted Jewellery & Keepsakes by Kshitija Latane',
    description: 'Discover thoughtfully handmade jewellery, festive keepsakes, diwali panti, and personalized gifts by Kshitija Latane at Kshitija’s Creations in Atpadi, Maharashtra.',
    canonicalPath: '/',
    keywords:
      "Kshitija Creation, Kshitijas Creations, Kshitija's Creations, Kshitija Latane, Kshitija Latane Atpadi, Kshitija Latane handmade, handmade product, handmade products, handmade jewellery, handmade jewellery Atpadi, handmade gifts Atapadi, Atpadi, Atapadi, Sangli, Maharashtra, handcrafted earrings, chokers, necklaces, bracelets, bangles, jewellery combo set, floral jewellery, silk thread jewellery, bridal jewellery, diwali diva, diwali panti, handmade diwali panti, decorative diya, pooja thali, haldi kumkum gifts, festive gifts, keepsakes, return gifts, buy handmade jewellery online, custom handmade gifts, WhatsApp ordering jewellery, हस्तकला, हस्तकला दागिने, आटपाडी",
  });

  const { data: banners, isLoading: loadingBanners } = useBanners();
  const { data: categories, isLoading: loadingCategories, error: categoriesError, refetch: refetchCategories } = useCategories();
  
  const { data: featuredResponse, isLoading: loadingFeatured } = useProducts({ featured: true, page: 0, size: 30 });
  const { data: newResponse, isLoading: loadingNew } = useProducts({ sort: 'newest', page: 0, size: 30 });

  
  const getCategoryDiverseProducts = (productsList: Product[], limit = 4) => {
    const seenCategoryIds = new Set<string>();
    const result: Product[] = [];
    const remaining: Product[] = [];

    for (const prod of productsList) {
      const catId = prod.category?.id || prod.categoryId || prod.category?.slug || 'uncategorized';
      if (!seenCategoryIds.has(catId)) {
        seenCategoryIds.add(catId);
        result.push(prod);
      } else {
        remaining.push(prod);
      }
      if (result.length >= limit) break;
    }

    while (result.length < limit && remaining.length > 0) {
      result.push(remaining.shift()!);
    }

    return result;
  };

  const featuredProducts = getCategoryDiverseProducts(featuredResponse?.content ?? [], 4);
  const newProducts = getCategoryDiverseProducts(newResponse?.content ?? [], 4);

  const activeCategories = (categories ?? [])
    .filter((c) => (c.isActive !== false && c.active !== false))
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const categoryImageBySlug = [...(newResponse?.content ?? []), ...(featuredResponse?.content ?? [])].reduce<Record<string, string>>(
    (images, product) => {
      const primaryImage = (product as Product & { primaryImage?: { url?: string; mediaType?: string } }).primaryImage;
      const image = primaryImage?.url && primaryImage.mediaType !== 'VIDEO'
        ? primaryImage
        : product.media?.find((media) => media.isPrimary && media.mediaType !== 'VIDEO')
          ?? product.media?.find((media) => media.mediaType !== 'VIDEO');
      if (image?.url && product.category?.slug && !images[product.category.slug]) {
        images[product.category.slug] = image.url;
      }
      return images;
    },
  {});

  return (
    <>
      {loadingBanners ? (
        <section className="w-full">
          <Skeleton className="min-h-[26rem] w-full sm:min-h-[28rem] lg:min-h-[31rem]" />
        </section>
      ) : banners && banners.length > 0 ? (
        <BannerCarousel banners={banners} />
      ) : null}

      {/* Quick Highlights Bar */}
      <section className="site-container pt-8 sm:pt-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5 rounded-4xl border border-beige/80 bg-surface/90 p-5 sm:p-6 shadow-soft">
          {highlights.map((item) => (
            <div className="flex items-center gap-3.5" key={item.title}>
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-rose/40 text-maroon shadow-2xs border border-beige/40">
                <item.icon className="size-5 text-maroon" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-ink font-sans">{item.title}</h3>
                <p className="text-[0.72rem] text-muted font-sans">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories / Collections */}
      <section className="section-space scroll-mt-32" id="categories">
        <div className="site-container">
          <SectionHeading
            align="center"
            description="Start with the craft, style, or piece you are looking for."
            eyebrow="Curated for You"
            title="Shop by category"
          />
          {categoriesError ? (
            <div className="mt-9">
              <ErrorMessage message="Could not load categories" onRetry={refetchCategories} />
            </div>
          ) : (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
              {loadingCategories ? (
                Array.from({ length: 5 }).map((_, i) => <CategorySkeleton key={i} />)
              ) : activeCategories.length === 0 ? (
                <div className="col-span-full py-12 text-center text-muted">No collections currently available.</div>
              ) : (
                activeCategories.map((category, index) => (
                  <CategoryCard
                    category={category}
                    imageUrl={categoryImageBySlug[category.slug]}
                    index={index}
                    key={category.id}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {/* Customer Favourites / Featured */}
      {loadingFeatured ? (
        <section className="section-space">
          <div className="site-container">
             <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
               <SectionHeading description="Small details, warm colours, and the pieces our customers reach for most." eyebrow="Customer favourites" title="Handmade, and much loved" />
             </div>
             <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
               {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
             </div>
          </div>
        </section>
      ) : featuredProducts && featuredProducts.length > 0 ? (
        <FeaturedProductSection
          description="Small details, warm colours, and the pieces our customers reach for most."
          eyebrow="Customer Favourites"
          products={featuredProducts}
          title="Handmade, and much loved"
        />
      ) : null}

      {/* New Arrivals */}
      {loadingNew ? (
        <section className="section-space">
          <div className="site-container">
             <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
               <SectionHeading description="New ideas are added in tiny batches—once they are gone, they may not return exactly the same." eyebrow="Just arrived" title="Fresh from the worktable" />
             </div>
             <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
               {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
             </div>
          </div>
        </section>
      ) : newProducts && newProducts.length > 0 ? (
        <FeaturedProductSection
          description="New ideas are added in tiny batches—once they are gone, they may not return exactly the same."
          eyebrow="Just Arrived"
          products={newProducts}
          title="Fresh from the worktable"
        />
      ) : null}

      {/* Workshop Story & Instagram Banner */}
      <section className="section-space">
        <div className="site-container grid overflow-hidden rounded-5xl bg-gradient-to-br from-maroon via-[#7B2034] to-[#541221] text-white shadow-float lg:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 lg:py-18">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.24em] text-rose backdrop-blur-md w-fit">
              <Sparkles className="size-3 text-gold" />
              <span>Behind the Scenes</span>
            </div>
            <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl lg:text-5xl leading-[1.15]">
              See the making, not just the finished piece
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-white/80 font-sans text-sm sm:text-base">
              Follow along for worktable moments, new drops, styling ideas, and the little handmade stories behind every design.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-white px-6 py-3 text-sm font-bold text-maroon shadow-md transition-all hover:bg-rose hover:shadow-lg"
                href={env.instagramUrl}
                rel="noreferrer noopener"
                target="_blank"
              >
                <Instagram aria-hidden="true" className="size-4.5" />
                <span>Visit our Instagram</span>
              </a>
              <Link
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                to="/products"
              >
                <span>Browse All</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
          <div className="grid min-h-72 place-items-center bg-[radial-gradient(circle_at_30%_20%,rgba(233,192,196,0.35),transparent_40%),radial-gradient(circle_at_70%_75%,rgba(201,164,91,0.3),transparent_45%)] p-6 sm:p-10">
            <div className="relative flex items-center justify-center">
              <div className="absolute -inset-3 rounded-full border border-white/20 bg-white/5 blur-xs" />
              <div className="relative size-60 sm:size-72 overflow-hidden rounded-full border-4 border-white/40 bg-surface shadow-glow group">
                <img
                  alt="Kshitija Creations logo"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src={kshitijaCreationImg}
                />
              </div>
              <div className="absolute bottom-2 right-2 grid size-12 place-items-center rounded-full bg-white text-maroon shadow-lg border-2 border-beige">
                <Instagram aria-hidden="true" className="size-6 text-maroon" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Artisan Values & Love Section */}
      <section className="section-space bg-gradient-to-b from-rose/20 via-canvas to-canvas">
        <div className="site-container grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="relative mx-auto grid aspect-square w-full max-w-md place-items-center rounded-[45%_55%_52%_48%/55%_45%_55%_45%] bg-gradient-to-br from-beige/80 to-rose/40 shadow-soft">
            <div className="grid size-44 place-items-center rounded-full bg-surface shadow-card sm:size-52 border border-beige/60">
              <Heart
                aria-hidden="true"
                className="size-20 text-maroon animate-pulse-glow"
                fill="rgb(var(--color-rose))"
                strokeWidth={1.2}
              />
            </div>
            <Sparkles aria-hidden="true" className="absolute right-10 top-10 size-8 text-gold animate-bounce" />
            <Gift aria-hidden="true" className="absolute bottom-10 left-10 size-9 text-maroon/50" />
          </div>
          <div>
            <SectionHeading
              description="Kshitija’s Creations is built around the joy of making something slowly and choosing something personally. Small-batch work lets every piece keep its warmth, texture, and individuality."
              eyebrow="Our Craft Philosophy"
              title="Handcrafted with Love, for Everyday Celebrations"
            />
            <p className="mt-5 text-sm leading-relaxed text-muted font-sans sm:text-base">
              Slight variations are part of the authentic charm. They are a gentle reminder that your piece passed through real artisan hands, not an impersonal assembly line.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link className="button-primary" to="/products">
                Find your piece
              </Link>
              <a
                className="button-secondary"
                href={env.instagramChatUrl}
                rel="noreferrer"
                target="_blank"
              >
                Custom Inquiries
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 4 Steps */}
      <section className="section-space">
        <div className="site-container">
          <SectionHeading
            align="center"
            description="A seamless, personal ordering experience directly with the maker—no complicated accounts or upfront card payments required."
            eyebrow="Simple & Transparent"
            title="From Our Worktable to Your Home"
          />
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {orderingSteps.map((step, index) => (
              <li
                className="group relative rounded-4xl border border-beige/80 bg-surface/90 p-6 sm:p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-card"
                key={step.label}
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-rose/50 text-maroon shadow-2xs border border-rose/60 transition-transform group-hover:scale-110">
                    <step.icon aria-hidden="true" className="size-6 text-maroon" />
                  </span>
                  <span className="font-serif text-3xl font-bold italic text-gold/80">0{index + 1}</span>
                </div>
                <h3 className="mt-6 font-display text-xl font-bold text-ink">{step.label}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted font-sans sm:text-sm">{step.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
};

export default HomePage;
