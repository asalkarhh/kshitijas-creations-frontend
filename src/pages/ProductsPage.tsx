import { SlidersHorizontal, Search, X, Filter } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ProductGrid } from '../components/product/ProductGrid';
import { ProductSkeleton } from '../components/product/ProductSkeleton';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Pagination } from '../components/common/Pagination';
import { usePageMetadata } from '../hooks/use-page-metadata';
import { useProducts } from '../hooks/use-products';
import { useCategories } from '../hooks/use-categories';
import { useDebounce } from '../hooks/use-debounce';
import { useState, useEffect } from 'react';

const sortOptions = [
  { label: 'Recommended', value: '' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'priceAsc' },
  { label: 'Price: High to Low', value: 'priceDesc' },
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') ?? '';
  const search = searchParams.get('search') ?? '';
  const sort = searchParams.get('sort') ?? '';
  const page = parseInt(searchParams.get('page') ?? '0', 10);
  
  const [searchInput, setSearchInput] = useState(search);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    if (debouncedSearch !== search) {
      const next = new URLSearchParams(searchParams);
      if (debouncedSearch) {
        next.set('search', debouncedSearch);
      } else {
        next.delete('search');
      }
      next.set('page', '0');
      setSearchParams(next);
    }
  }, [debouncedSearch, search, searchParams, setSearchParams]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  usePageMetadata({
    title: 'All products',
    description: 'Browse handmade earrings, bracelets, gifts and keepsakes handcrafted in small batches.',
    canonicalPath: '/products',
  });

  const { data: categoriesData } = useCategories();
  const categories = categoriesData || [];

  const { data: productsData, isLoading, error, refetch } = useProducts({
    category: category || undefined,
    page,
    size: 12,
    sort: sort || undefined,
    search: search || undefined,
  });

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '0');
    setSearchParams(next);
  };

  const removeParam = (key: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    next.set('page', '0');
    if (key === 'search') setSearchInput('');
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchInput('');
  };

  const hasFilters = Boolean(category || search || sort);
  const selectedCategoryName = categories.find((c) => c.slug === category)?.name || category;
  const selectedSortOption = sortOptions.find((s) => s.value === sort);

  return (
    <div className="site-container py-10 sm:py-14">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Products' }]} />
      <header className="mt-7 max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-maroon/75">The catalogue</p>
        <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
          Find something made for you
        </h1>
        <p className="mt-4 leading-7 text-muted">
          Browse the current small-batch collection. Availability is shown on every piece.
        </p>
      </header>

      {/* Filter / Search Bar */}
      <div className="my-9 border-y border-beige py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <label className="sr-only" htmlFor="search-input">Search products</label>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted" />
            <input
              id="search-input"
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-full border border-beige bg-surface text-sm text-ink placeholder:text-muted focus:border-maroon focus:outline-none focus:ring-2 focus:ring-rose"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput('');
                  removeParam('search');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink"
                aria-label="Clear search text"
                type="button"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Desktop Filter Controls */}
          <div className="hidden sm:flex sm:items-center sm:gap-3">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              <SlidersHorizontal aria-hidden="true" className="size-4 text-maroon" /> Filters
            </div>

            <select
              className="min-h-11 rounded-full border border-beige bg-surface px-4 text-sm text-ink focus:border-maroon focus:outline-none focus:ring-2 focus:ring-rose"
              aria-label="Filter by category"
              onChange={(event) => setParam('category', event.target.value)}
              value={category}
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              className="min-h-11 rounded-full border border-beige bg-surface px-4 text-sm text-ink focus:border-maroon focus:outline-none focus:ring-2 focus:ring-rose"
              aria-label="Sort products"
              onChange={(event) => setParam('sort', event.target.value)}
              value={sort}
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Mobile Filter Toggle Button */}
          <div className="flex sm:hidden items-center justify-between gap-2">
            <button
              onClick={() => setMobileFiltersOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-beige bg-surface px-4 py-2 text-sm font-semibold text-ink hover:bg-rose/10"
              type="button"
              aria-expanded={mobileFiltersOpen}
            >
              <Filter className="size-4 text-maroon" />
              {mobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
              {hasFilters && <span className="size-2 rounded-full bg-maroon" />}
            </button>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-maroon hover:underline"
                type="button"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFiltersOpen && (
          <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-rose/10 p-4 sm:hidden">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5" htmlFor="mobile-category">
                Category
              </label>
              <select
                id="mobile-category"
                className="w-full rounded-full border border-beige bg-surface px-4 py-2 text-sm text-ink focus:border-maroon focus:outline-none focus:ring-2 focus:ring-rose"
                onChange={(event) => setParam('category', event.target.value)}
                value={category}
              >
                <option value="">All categories</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5" htmlFor="mobile-sort">
                Sort By
              </label>
              <select
                id="mobile-sort"
                className="w-full rounded-full border border-beige bg-surface px-4 py-2 text-sm text-ink focus:border-maroon focus:outline-none focus:ring-2 focus:ring-rose"
                onChange={(event) => setParam('sort', event.target.value)}
                value={sort}
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Active Filter Summary Pills */}
        {hasFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-beige/60">
            <span className="text-xs font-medium text-muted">Active filters:</span>
            {category && (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface border border-beige px-3 py-1 text-xs font-medium text-ink shadow-sm">
                Category: <strong className="font-semibold text-maroon">{selectedCategoryName}</strong>
                <button
                  onClick={() => removeParam('category')}
                  className="ml-1 p-0.5 text-muted hover:text-maroon rounded-full"
                  aria-label={`Remove category filter for ${selectedCategoryName}`}
                  type="button"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface border border-beige px-3 py-1 text-xs font-medium text-ink shadow-sm">
                Search: &ldquo;<strong className="font-semibold text-maroon">{search}</strong>&rdquo;
                <button
                  onClick={() => removeParam('search')}
                  className="ml-1 p-0.5 text-muted hover:text-maroon rounded-full"
                  aria-label="Remove search filter"
                  type="button"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {sort && selectedSortOption && (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface border border-beige px-3 py-1 text-xs font-medium text-ink shadow-sm">
                Sort: <strong className="font-semibold text-maroon">{selectedSortOption.label}</strong>
                <button
                  onClick={() => removeParam('sort')}
                  className="ml-1 p-0.5 text-muted hover:text-maroon rounded-full"
                  aria-label="Remove sort filter"
                  type="button"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="ml-auto text-xs font-semibold text-maroon hover:underline"
              type="button"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {error ? (
        <ErrorMessage message="We couldn't load the products. Please try again." onRetry={refetch} />
      ) : (
        <>
          <p className="mb-6 text-sm text-muted">
            {isLoading ? 'Loading...' : `${productsData?.totalElements ?? 0} ${productsData?.totalElements === 1 ? 'piece' : 'pieces'}`}
          </p>
          
          {isLoading ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-7">
              {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : (
            <>
              <ProductGrid products={productsData?.content || []} />
              {productsData && productsData.totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination 
                    currentPage={page} 
                    totalPages={productsData.totalPages} 
                    onPageChange={(newPage) => {
                      const next = new URLSearchParams(searchParams);
                      next.set('page', newPage.toString());
                      setSearchParams(next);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                  />
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsPage;

