import { SlidersHorizontal, Search, X, Filter, Sparkles } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ProductGrid } from '../components/product/ProductGrid';
import { ProductSkeleton } from '../components/product/ProductSkeleton';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { usePageMetadata } from '../hooks/use-page-metadata';
import { useProducts } from '../hooks/use-products';
import { useCategories } from '../hooks/use-categories';
import { useDebounce } from '../hooks/use-debounce';
import { useState, useEffect } from 'react';

const sortOptions = [
  { label: 'Recommended', value: '' },
  { label: 'Newest Arrivals', value: 'newest' },
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
    title: 'All Products | Handcrafted Jewellery & Keepsakes',
    description: 'Browse handmade earrings, chokers, necklaces, bracelets, diwali panti, gifts and keepsakes handcrafted in Atpadi by Kshitija Latane.',
    canonicalPath: '/products',
    keywords:
      "buy handmade jewellery, handmade earrings, handmade necklaces, handmade chokers, handcrafted bracelets, diwali panti online, handmade gifts Atpadi, Kshitija Latane handmade products, Kshitija Creation, Atpadi",
  });

  const { data: categoriesData } = useCategories();
  const categories = categoriesData || [];

  const { data: productsData, isLoading, error, refetch } = useProducts({
    category: category || undefined,
    page,
    size: 100,
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
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'All Creations' }]} />
      
      {/* Header */}
      <header className="mt-8 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-rose/30 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.24em] text-maroon shadow-2xs font-sans">
          <Sparkles className="size-3 text-gold" />
          <span>The Atelier Catalogue</span>
        </div>
        <h1 className="mt-3 font-display text-4xl font-extrabold text-ink sm:text-5xl lg:text-6xl tracking-tight">
          Find something made for you
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base font-sans">
          Explore our small-batch earrings, chokers, necklaces, bracelets, and celebratory keepsakes. Every piece is handcrafted in India with love.
        </p>
      </header>

      {/* Category Pills Bar */}
      <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setParam('category', '')}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all shadow-xs ${
            !category
              ? 'bg-maroon text-white shadow-sm'
              : 'bg-surface border border-beige/80 text-ink/80 hover:bg-rose/40 hover:text-maroon'
          }`}
          type="button"
        >
          All Pieces
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setParam('category', c.slug)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all shadow-xs ${
              category === c.slug
                ? 'bg-maroon text-white shadow-sm'
                : 'bg-surface border border-beige/80 text-ink/80 hover:bg-rose/40 hover:text-maroon'
            }`}
            type="button"
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Filter / Search Bar */}
      <div className="my-7 rounded-3xl border border-beige/80 bg-surface/90 p-4 sm:p-5 shadow-soft">
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
              className="w-full pl-10 pr-9 py-2.5 rounded-full border border-beige bg-canvas/60 text-sm text-ink placeholder:text-muted/70 focus:border-maroon focus:outline-none focus:ring-2 focus:ring-rose/80 font-sans"
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
            <select
              className="min-h-11 rounded-full border border-beige bg-canvas/60 px-4 text-xs font-bold text-ink focus:border-maroon focus:outline-none focus:ring-2 focus:ring-rose/80 font-sans"
              aria-label="Filter by category"
              onChange={(event) => setParam('category', event.target.value)}
              value={category}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted font-sans">
              <SlidersHorizontal aria-hidden="true" className="size-3.5 text-maroon" /> Sort
            </div>

            <select
              className="min-h-11 rounded-full border border-beige bg-canvas/60 px-4 text-xs font-bold text-ink focus:border-maroon focus:outline-none focus:ring-2 focus:ring-rose/80 font-sans"
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
              className="flex items-center gap-2 rounded-full border border-beige bg-canvas/70 px-4 py-2 text-xs font-bold text-ink"
              type="button"
              aria-expanded={mobileFiltersOpen}
            >
              <Filter className="size-3.5 text-maroon" />
              {mobileFiltersOpen ? 'Hide Filters' : 'Filter & Sort'}
              {hasFilters && <span className="size-2 rounded-full bg-maroon" />}
            </button>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-maroon hover:underline"
                type="button"
                aria-label="Reset all filters"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFiltersOpen && (
          <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-rose/20 p-4 sm:hidden">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5 font-sans" htmlFor="mobile-category">
                Category
              </label>
              <select
                id="mobile-category"
                aria-label="Filter by category"
                className="w-full rounded-full border border-beige bg-surface px-4 py-2 text-xs font-bold text-ink focus:border-maroon focus:outline-none focus:ring-2 focus:ring-rose font-sans"
                onChange={(event) => setParam('category', event.target.value)}
                value={category}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5 font-sans" htmlFor="mobile-sort">
                Sort Options
              </label>
              <select
                id="mobile-sort"
                className="w-full rounded-full border border-beige bg-surface px-4 py-2 text-xs font-bold text-ink focus:border-maroon focus:outline-none focus:ring-2 focus:ring-rose font-sans"
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
            <span className="text-xs font-bold text-muted font-sans">Active filters:</span>
            {category && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface border border-beige/80 px-3 py-1 text-xs font-semibold text-ink shadow-xs">
                Category: <strong className="font-bold text-maroon">{selectedCategoryName}</strong>
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
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface border border-beige/80 px-3 py-1 text-xs font-semibold text-ink shadow-xs">
                Keyword: &ldquo;<strong className="font-bold text-maroon">{search}</strong>&rdquo;
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
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface border border-beige/80 px-3 py-1 text-xs font-semibold text-ink shadow-xs">
                Sort: <strong className="font-bold text-maroon">{selectedSortOption.label}</strong>
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
              className="ml-auto text-xs font-bold text-maroon hover:underline"
              type="button"
              aria-label="Clear all filters"
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
          <div className="mb-6 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted font-sans">
              {isLoading ? 'Discovering pieces...' : `Showing ${productsData?.totalElements ?? 0} ${productsData?.totalElements === 1 ? 'handcrafted creation' : 'handcrafted creations'}`}
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : (
            <ProductGrid products={productsData?.content || []} />
          )}
        </>
      )}
    </div>
  );
};

export default ProductsPage;
