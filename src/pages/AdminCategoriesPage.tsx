import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  CheckCircle2,
  Edit2,
  Loader2,
  Plus,
  RotateCcw,
  Tags,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { adminApi } from '../api/admin';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { Skeleton } from '../components/common/Skeleton';
import { useToast } from '../components/common/Toast';
import { usePageMetadata } from '../hooks/use-page-metadata';
import { categorySchema, type CategoryFormValues } from '../schemas/admin';
import type { ApiError, Category } from '../types';
import { formatISTDateTime } from './AdminDashboardPage';

const AdminCategoriesPage = () => {
  usePageMetadata({
    title: 'Manage categories',
    description: 'Create, update, and manage studio product categories.',
    canonicalPath: '/admin/categories',
  });

  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    data: categories = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: adminApi.getCategories,
    staleTime: 60_000,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      displayOrder: 0,
      active: true,
    },
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormError(null);
    reset({
      name: '',
      description: '',
      displayOrder: (categories.length ?? 0) + 1,
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormError(null);
    reset({
      name: category.name,
      description: category.description || '',
      displayOrder: category.displayOrder ?? 0,
      active: category.isActive ?? category.active ?? true,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormError(null);
    reset();
  };

  // Create / Update Mutation
  const saveMutation = useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      if (editingCategory) {
        return await adminApi.updateCategory(editingCategory.id, values);
      }
      return await adminApi.createCategory(values);
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showToast(
        editingCategory
          ? `Category "${saved.name}" updated successfully.`
          : `Category "${saved.name}" created successfully.`,
        'success',
      );
      closeModal();
    },
    onError: (err) => {
      const apiErr = err as unknown as ApiError;
      setFormError(apiErr.message || 'Failed to save category. Please try again.');
    },
  });

  // Delete / Deactivate Mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ id }: { id: string; name: string }) => {
      await adminApi.deleteCategory(id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showToast(`Category "${variables.name}" removed successfully.`, 'success');
      setDeletingCategory(null);
    },
    onError: (err) => {
      const apiErr = err as unknown as ApiError;
      showToast(apiErr.message || 'Could not delete category.', 'error');
      setDeletingCategory(null);
    },
  });

  const onSubmit = (values: CategoryFormValues) => {
    setFormError(null);
    saveMutation.mutate(values);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-maroon/75">
            Catalog hierarchy
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
            Categories
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage product collections, display sequences, and storefront visibility.
          </p>
        </div>
        <button
          className="button-primary inline-flex items-center gap-1.5 py-2.5 px-4 text-xs font-semibold"
          onClick={openCreateModal}
          type="button"
        >
          <Plus className="size-4" /> Add Category
        </button>
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
              <p className="font-semibold">Unable to load categories</p>
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

      {/* Categories Table / Cards */}
      <div className="rounded-3xl border border-beige bg-surface p-6 shadow-soft sm:p-8">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                className="flex items-center justify-between py-3.5 border-b border-beige/60"
                key={i}
              >
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center">
            <Tags aria-hidden="true" className="mx-auto size-10 text-muted" />
            <h2 className="mt-3 font-display text-lg text-ink">No categories found</h2>
            <p className="mt-1 text-xs text-muted max-w-sm mx-auto">
              Get started by adding a category like Earrings, Necklaces, or Bracelets.
            </p>
            <button
              className="button-primary mt-5 inline-flex items-center gap-1.5 py-2 px-4 text-xs"
              onClick={openCreateModal}
              type="button"
            >
              <Plus className="size-3.5" /> Add First Category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-beige text-[0.7rem] font-bold uppercase tracking-wider text-muted">
                <tr>
                  <th className="py-3 px-3">Order</th>
                  <th className="py-3 px-3">Category Name</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Created</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/60">
                {categories.map((cat) => {
                  const isActive = cat.isActive ?? cat.active ?? true;
                  return (
                    <tr className="hover:bg-rose/5 transition-colors" key={cat.id}>
                      <td className="py-3.5 px-3 font-mono text-xs text-muted">
                        {cat.displayOrder ?? 0}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-ink">
                        <span>{cat.name}</span>
                        <span className="block font-mono text-[0.7rem] text-muted font-normal">
                          /{cat.slug}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-xs text-muted max-w-xs truncate">
                        {cat.description || '—'}
                      </td>
                      <td className="py-3.5 px-3">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="size-3 text-emerald-600" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-700 border border-neutral-200">
                            <XCircle className="size-3 text-neutral-500" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-xs text-muted whitespace-nowrap">
                        {formatISTDateTime(cat.createdAt)}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            aria-label={`Edit ${cat.name}`}
                            className="grid size-8 place-items-center rounded-full text-muted hover:bg-rose/20 hover:text-maroon focus-visible:outline focus-visible:outline-2 focus-visible:outline-maroon"
                            onClick={() => openEditModal(cat)}
                            type="button"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button
                            aria-label={`Delete ${cat.name}`}
                            className="grid size-8 place-items-center rounded-full text-muted hover:bg-rose/20 hover:text-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-600"
                            onClick={() => setDeletingCategory(cat)}
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
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            aria-modal="true"
            className="w-full max-w-lg rounded-3xl border border-beige bg-surface p-6 shadow-xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <div className="flex items-center justify-between border-b border-beige pb-4">
              <h2 className="font-display text-2xl font-bold text-ink">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                aria-label="Close dialog"
                className="grid size-8 place-items-center rounded-full text-muted hover:bg-rose/20"
                onClick={closeModal}
                type="button"
              >
                <X className="size-5" />
              </button>
            </div>

            {formError && (
              <div
                className="mt-4 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800"
                role="alert"
              >
                <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
                <p>{formError}</p>
              </div>
            )}

            <form className="mt-5 space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
              {/* Name */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="cat-name">
                  Category name <span className="text-maroon">*</span>
                </label>
                <input
                  {...register('name')}
                  aria-describedby={errors.name ? 'cat-name-error' : undefined}
                  aria-invalid={Boolean(errors.name)}
                  className="form-input text-sm"
                  id="cat-name"
                  placeholder="e.g. Earrings"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-maroon" id="cat-name-error" role="alert">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="cat-desc">
                  Description <span className="text-muted font-normal">(optional, max 500)</span>
                </label>
                <textarea
                  {...register('description')}
                  aria-describedby={errors.description ? 'cat-desc-error' : undefined}
                  aria-invalid={Boolean(errors.description)}
                  className="form-input text-sm min-h-[4rem] resize-y"
                  id="cat-desc"
                  placeholder="Brief description of pieces in this category"
                  rows={2}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-maroon" id="cat-desc-error" role="alert">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Display Order */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="cat-order">
                  Display order
                </label>
                <input
                  {...register('displayOrder', { valueAsNumber: true })}
                  aria-describedby={errors.displayOrder ? 'cat-order-error' : undefined}
                  aria-invalid={Boolean(errors.displayOrder)}
                  className="form-input text-sm max-w-xs"
                  id="cat-order"
                  min={0}
                  type="number"
                />
                {errors.displayOrder && (
                  <p className="mt-1 text-xs text-maroon" id="cat-order-error" role="alert">
                    {errors.displayOrder.message}
                  </p>
                )}
              </div>

              {/* Active Switch */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    {...register('active')}
                    className="size-4 rounded border-beige text-maroon focus:ring-maroon"
                    id="cat-active"
                    type="checkbox"
                  />
                  <span className="text-sm font-semibold text-ink">Active on storefront</span>
                </label>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-beige pt-4">
                <button
                  className="button-secondary py-2 px-4 text-xs"
                  onClick={closeModal}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  aria-busy={isSubmitting || saveMutation.isPending}
                  className="button-primary py-2 px-5 text-xs inline-flex items-center gap-2"
                  disabled={isSubmitting || saveMutation.isPending}
                  type="submit"
                >
                  {isSubmitting || saveMutation.isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" /> Saving...
                    </>
                  ) : editingCategory ? (
                    'Update Category'
                  ) : (
                    'Create Category'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        confirmLabel="Remove Category"
        description={`Are you sure you want to remove "${deletingCategory?.name}"? It will no longer appear in the catalogue.`}
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        onConfirm={() =>
          deletingCategory &&
          deleteMutation.mutate({ id: deletingCategory.id, name: deletingCategory.name })
        }
        title="Remove Category"
      />
    </div>
  );
};

export default AdminCategoriesPage;
