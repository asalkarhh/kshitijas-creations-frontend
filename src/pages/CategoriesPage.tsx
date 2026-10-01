import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { ProductSkeleton } from '../components/product/ProductSkeleton';
import { ProductScrollRow } from '../components/product/ProductScrollRow';
import { SquareCategoryCard } from '../components/product/SquareCategoryCard';
import { useCategories } from '../hooks/use-categories';
import { usePageMetadata } from '../hooks/use-page-metadata';
import { useProducts } from '../hooks/use-products';
import type { Category, Product } from '../types';

export const CategoriesPage = () => {
  usePageMetadata({
    title: 'All Categories - Kshitija’s Creations',
    description: 'Explore our handcrafted jewellery, keepsakes, and festive gift collections by category.',
    canonicalPath: '/categories',
  });

  const {
    data: categories = [],
    isLoading: loadingCategories,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories();

  const { data: productsData, isLoading: loadingProducts } = useProducts({
    page: 0,
    size: 100,
  });

  const allProducts = productsData?.content ?? [];
  const activeCategories = categories.filter((c) => c.isActive !== false);

  return (
    <div className="site-container space-y-16 py-8 sm:py-12">
      {/* All Categories Header & Square Cards Grid (Reference Layout) */}
      <section aria-labelledby="all-categories-heading" className="space-y-6">
        <div className="flex items-center justify-between border-b border-beige/80 pb-4">
          <div>
            <h1
              className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl"
              id="all-categories-heading"
            >
              All categories
            </h1>
            <p className="mt-1 text-sm font-medium text-muted">
              {activeCategories.length} {activeCategories.length === 1 ? 'collection' : 'collections'} available
            </p>
          </div>

          <Link
            className="text-sm font-bold text-ink underline underline-offset-4 hover:text-maroon transition-colors"
            to="/products"
          >
            View all products
          </Link>
        </div>

        {loadingCategories ? (
          <div className="grid grid-cols-1 gap-6 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-beige/60" />
            ))}
          </div>
        ) : categoriesError ? (
          <ErrorMessage message="Could not load categories." onRetry={refetchCategories} />
        ) : activeCategories.length === 0 ? (
          <p className="text-center text-sm text-muted">No categories available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {activeCategories.map((category) => {
              const categoryProducts = allProducts.filter(
                (p) =>
                  p.category?.id === category.id ||
                  p.category?.slug === category.slug ||
                  p.category?.name?.toLowerCase() === category.name.toLowerCase(),
              );

              const firstProduct = categoryProducts[0];
              const categoryImageUrl =
                category.imageUrl ||
                firstProduct?.media?.find((m) => m.isPrimary && m.mediaType !== 'VIDEO')?.url ||
                firstProduct?.media?.find((m) => m.mediaType !== 'VIDEO')?.url ||
                firstProduct?.media?.[0]?.url;

              return (
                <SquareCategoryCard
                  key={category.id}
                  category={category}
                  imageUrl={categoryImageUrl}
                  productCount={categoryProducts.length || category.productCount}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Category-wise Showcase Sections Below */}
      <div className="space-y-16 pt-4 border-t border-beige/60">
        {loadingCategories || loadingProducts ? (
          <ProductSkeleton count={4} />
        ) : (
          activeCategories.map((category: Category) => {
            const categoryProducts = allProducts.filter(
              (p) =>
                p.category?.id === category.id ||
                p.category?.slug === category.slug ||
                p.category?.name?.toLowerCase() === category.name.toLowerCase(),
            );

            return (
              <section
                key={category.id}
                aria-labelledby={`cat-section-${category.id}`}
                className="rounded-3xl border border-beige/80 bg-surface/40 p-6 sm:p-8 shadow-xs space-y-6"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-beige/60 pb-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-maroon font-sans">
                      <Sparkles className="size-3.5 text-gold" />
                      Collection
                    </span>
                    <h2
                      className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl"
                      id={`cat-section-${category.id}`}
                    >
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="mt-1 text-sm text-muted max-w-2xl">{category.description}</p>
                    )}
                  </div>

                  <Link
                    className="group inline-flex items-center gap-2 text-sm font-bold text-maroon hover:text-ink transition-colors self-start sm:self-auto"
                    to={`/products?category=${encodeURIComponent(category.slug || category.name)}`}
                  >
                    <span>View all {category.name} creations</span>
                    <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </div>

                {/* Horizontal Product Scroll Row */}
                <ProductScrollRow products={categoryProducts} />
              </section>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
