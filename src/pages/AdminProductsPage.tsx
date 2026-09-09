import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  CheckCircle2,
  Edit2,
  Package,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminApi } from '../api/admin';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { Pagination } from '../components/common/Pagination';
import { Skeleton } from '../components/common/Skeleton';
import { useToast } from '../components/common/Toast';
import { ProductMedia } from '../components/product/ProductMedia';
import { usePageMetadata } from '../hooks/use-page-metadata';
import type { ApiError, Product } from '../types';
import { formatPrice } from '../utils/currency';
import { formatISTDateTime } from './AdminDashboardPage';

const AdminProductsPage = () => {
  usePageMetadata({
    title: 'Manage products',
    description: 'Catalog products list, stock availability, and featured settings.',
    canonicalPath: '/admin/products',
  });

  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('categoryId') || '';
  const availableParam = searchParams.get('available') || '';
  const featuredParam = searchParams.get('featured') || '';
  const sortParam = searchParams.get('sort') || '';
  const pageParam = parseInt(searchParams.get('page') || '0', 10);

  const [searchInput, setSearchInput] = useState(searchParam);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Categories for filter dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: adminApi.getCategories,
    staleTime: 60_000,
  });

  // Debounced search sync to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== searchParam) {
        const next = new URLSearchParams(searchParams);
        if (searchInput.trim()) {
          next.set('search', searchInput.trim());
        } else {
          next.delete('search');
        }
        next.set('page', '0');
        setSearchParams(next, { replace: true });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput, searchParam, searchParams, setSearchParams]);

  // Products query
  const {
    data: productData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'admin',
      'products',
      {
        search: searchParam,
        categoryId: categoryParam,
        available: availableParam,
        featured: featuredParam,
        sort: sortParam,
        page: pageParam,
      },
    ],
    queryFn: () =>
      adminApi.getProducts({
        search: searchParam || undefined,
        categoryId: categoryParam || undefined,
        available: availableParam ? availableParam === 'true' : undefined,
        featured: featuredParam ? featuredParam === 'true' : undefined,
        sort: sortParam || undefined,
        page: pageParam,
        size: 10,
      }),
    staleTime: 60_000,
  });

  const products = productData?.content ?? [];
  const totalPages = productData?.totalPages ?? 0;
  const totalElements = productData?.totalElements ?? 0;

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '0');
    setSearchParams(next);
  };

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
  };

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ id }: { id: string; name: string }) => {
      await adminApi.deleteProduct(id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      showToast(
        `Product "${variables.name}" removed from public catalogue.`,
        'success',
      );
      setDeletingProduct(null);
    },
    onError: (err) => {
      const apiErr = err as unknown as ApiError;
      showToast(apiErr.message || 'Could not delete product.', 'error');
      setDeletingProduct(null);
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-maroon/75">
            Studio inventory
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
            Products
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage your small-batch creations, pricing, stock availability, and featured status.
          </p>
        </div>
        <Link
          className="button-primary inline-flex items-center gap-1.5 py-2.5 px-4 text-xs font-semibold"
          to="/admin/products/new"
        >
          <Plus className="size-4" /> Add Product
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="rounded-3xl border border-beige bg-surface p-5 shadow-soft">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted" />
            <input
              aria-label="Search products by name or code"
              className="form-input pl-10 text-sm"
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or code..."
              type="text"
              value={searchInput}
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              aria-label="Filter by category"
              className="form-input text-sm"
              onChange={(e) => updateParam('categoryId', e.target.value)}
              value={categoryParam}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <select
              aria-label="Filter by availability"
              className="form-input text-sm"
              onChange={(e) => updateParam('available', e.target.value)}
              value={availableParam}
            >
              <option value="">All Stock Status</option>
              <option value="true">In Stock / Available</option>
              <option value="false">Out of Stock</option>
            </select>
          </div>

          {/* Featured Filter */}
          <div>
            <select
              aria-label="Filter by featured status"
              className="form-input text-sm"
              onChange={(e) => updateParam('featured', e.target.value)}
              value={featuredParam}
            >
              <option value="">All Products</option>
              <option value="true">Featured Pieces</option>
              <option value="false">Standard Pieces</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div
          className="flex items-start justify-between gap-4 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to load products</p>
              <p className="mt-1 text-sm text-rose-700">
                {(error as Error)?.message || 'Please check your connection and try again.'}
              </p>
            </div>
          </div>
          <button
            className="button-secondary shrink-0 text-xs border-rose-300 hover:bg-rose-100"
            onClick={() => refetch()}
            type="button"
          >
            <RotateCcw className="size-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Products Table */}
      <div className="rounded-3xl border border-beige bg-surface p-6 shadow-soft sm:p-8">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                className="flex items-center justify-between py-3.5 border-b border-beige/60"
                key={i}
              >
                <Skeleton className="size-12 rounded-xl" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center">
            <Package aria-hidden="true" className="mx-auto size-10 text-muted" />
            <h2 className="mt-3 font-display text-lg text-ink">No products found</h2>
            <p className="mt-1 text-xs text-muted max-w-sm mx-auto">
              {searchParam || categoryParam || availableParam || featuredParam
                ? 'Try adjusting your filters or search terms to find pieces.'
                : 'Get started by creating your first handmade product.'}
            </p>
            <Link
              className="button-primary mt-5 inline-flex items-center gap-1.5 py-2 px-4 text-xs"
              to="/admin/products/new"
            >
              <Plus className="size-3.5" /> Add Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-beige text-[0.7rem] font-bold uppercase tracking-wider text-muted">
                <tr>
                  <th className="py-3 px-3">Item</th>
                  <th className="py-3 px-3">Code</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Availability</th>
                  <th className="py-3 px-3">Featured</th>
                  <th className="py-3 px-3">Created</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/60">
                {products.map((product) => {
                  const isAvailable = product.isAvailable ?? product.available ?? true;
                  const isFeatured = product.isFeatured ?? product.featured ?? false;
                  const primaryMedia =
                    product.media?.find((m) => m.isPrimary) ?? product.media?.[0];

                  return (
                    <tr className="hover:bg-rose/5 transition-colors" key={product.id}>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-beige">
                            <ProductMedia
                              alt={primaryMedia?.altText || product.name}
                              className="h-full w-full object-cover"
                              src={primaryMedia?.url}
                            />
                          </div>
                          <div className="min-w-0">
                            <Link
                              className="font-semibold text-ink hover:text-maroon line-clamp-1"
                              to={`/admin/products/${product.id}/edit`}
                            >
                              {product.name}
                            </Link>
                            <span className="block text-[0.7rem] text-muted">
                              {product.media?.length ?? 0} media assets
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-xs font-bold text-muted">
                        {product.productCode || '—'}
                      </td>
                      <td className="py-3.5 px-3 text-xs text-muted">
                        {product.category?.name || '—'}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-maroon">
                        {formatPrice(product.price)}
                      </td>
                      <td className="py-3.5 px-3">
                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="size-3 text-emerald-600" /> In stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-800 border border-rose-200">
                            <XCircle className="size-3 text-rose-600" /> Unavailable
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        {isFeatured ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
                            <Sparkles className="size-3 text-amber-600" /> Featured
                          </span>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-xs text-muted whitespace-nowrap">
                        {formatISTDateTime(product.createdAt)}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            aria-label={`Edit ${product.name}`}
                            className="grid size-8 place-items-center rounded-full text-muted hover:bg-rose/20 hover:text-maroon focus-visible:outline focus-visible:outline-2 focus-visible:outline-maroon"
                            to={`/admin/products/${product.id}/edit`}
                          >
                            <Edit2 className="size-4" />
                          </Link>
                          <button
                            aria-label={`Delete ${product.name}`}
                            className="grid size-8 place-items-center rounded-full text-muted hover:bg-rose/20 hover:text-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-600"
                            onClick={() => setDeletingProduct(product)}
                            type="button"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination & Total count */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-beige pt-4">
            <p className="text-xs text-muted">
              Showing {products.length} of {totalElements} products
            </p>
            <Pagination
              currentPage={pageParam}
              onPageChange={handlePageChange}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>

      {/* Soft-Delete Confirmation Dialog */}
      <ConfirmationDialog
        confirmLabel="Remove from Catalogue"
        description={`Are you sure you want to remove "${deletingProduct?.name}"? It will no longer be visible on the public website. Existing customer orders will not be affected.`}
        isOpen={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={() =>
          deletingProduct &&
          deleteMutation.mutate({ id: deletingProduct.id, name: deletingProduct.name })
        }
        title="Remove Product from Catalogue"
      />
    </div>
  );
};

export default AdminProductsPage;
