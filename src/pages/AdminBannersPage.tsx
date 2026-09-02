import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Calendar,
  Edit2,
  ExternalLink,
  Image as ImageIcon,
  Info,
  Loader2,
  Plus,
  RotateCcw,
  Smartphone,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { adminApi } from '../api/admin';
import { BannerStatusBadge } from '../components/admin/BannerStatusBadge';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { Skeleton } from '../components/common/Skeleton';
import { useToast } from '../components/common/Toast';
import { usePageMetadata } from '../hooks/use-page-metadata';
import { bannerSchema, type BannerFormValues } from '../schemas/banner';
import type { ApiError, Banner } from '../types';
import { getBannerStatus } from '../utils/banner';
import {
  dateTimeLocalToUtc,
  formatISTCompact,
  utcToDateTimeLocal,
} from '../utils/date';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const AdminBannersPage = () => {
  usePageMetadata({
    title: 'Manage banners',
    description: 'Create, schedule, and manage promotional storefront hero banners.',
    canonicalPath: '/admin/banners',
  });

  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deletingBanner, setDeletingBanner] = useState<Banner | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // File states
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Banners
  const {
    data: banners = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'banners'],
    queryFn: adminApi.getBanners,
    staleTime: 60_000,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      buttonText: '',
      targetUrl: '',
      startAt: '',
      endAt: '',
      displayOrder: 0,
      active: true,
    },
  });

  const openCreateModal = () => {
    setEditingBanner(null);
    setFormError(null);
    setFileError(null);
    setDesktopFile(null);
    setDesktopPreview(null);
    setMobileFile(null);
    setMobilePreview(null);

    reset({
      title: '',
      subtitle: '',
      buttonText: 'Explore Collection',
      targetUrl: '/products',
      startAt: '',
      endAt: '',
      displayOrder: (banners.length ?? 0) + 1,
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setFormError(null);
    setFileError(null);
    setDesktopFile(null);
    setDesktopPreview(banner.desktopImageUrl || null);
    setMobileFile(null);
    setMobilePreview(banner.mobileImageUrl || null);

    reset({
      title: banner.title,
      subtitle: banner.subtitle || '',
      buttonText: banner.buttonText || '',
      targetUrl: banner.targetLink || banner.targetUrl || '',
      startAt: utcToDateTimeLocal(banner.startAt),
      endAt: utcToDateTimeLocal(banner.endAt),
      displayOrder: banner.displayOrder ?? 0,
      active: banner.isActive ?? banner.active ?? true,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setFormError(null);
    setFileError(null);
    setDesktopFile(null);
    setDesktopPreview(null);
    setMobileFile(null);
    setMobilePreview(null);
    reset();
  };

  // Image Selection Handlers
  const handleDesktopFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFileError(`"${file.name}" is not a supported format (JPEG, PNG, WebP).`);
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setFileError(`"${file.name}" exceeds the 5 MB file size limit.`);
      return;
    }

    setDesktopFile(file);
    setDesktopPreview(URL.createObjectURL(file));
  };

  const handleMobileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFileError(`"${file.name}" is not a supported format (JPEG, PNG, WebP).`);
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setFileError(`"${file.name}" exceeds the 5 MB file size limit.`);
      return;
    }

    setMobileFile(file);
    setMobilePreview(URL.createObjectURL(file));
  };

  // Create / Update Mutation
  const saveMutation = useMutation({
    mutationFn: async (values: BannerFormValues) => {
      const formData = new FormData();
      formData.append('title', values.title.trim());
      if (values.subtitle?.trim()) formData.append('subtitle', values.subtitle.trim());
      if (values.buttonText?.trim()) formData.append('buttonText', values.buttonText.trim());
      if (values.targetUrl?.trim()) formData.append('targetUrl', values.targetUrl.trim());
      formData.append('displayOrder', String(values.displayOrder ?? 0));
      formData.append('active', String(values.active));

      const utcStart = dateTimeLocalToUtc(values.startAt);
      const utcEnd = dateTimeLocalToUtc(values.endAt);
      if (utcStart) formData.append('startAt', utcStart);
      if (utcEnd) formData.append('endAt', utcEnd);

      if (desktopFile) formData.append('desktopImage', desktopFile);
      if (mobileFile) formData.append('mobileImage', mobileFile);

      if (editingBanner) {
        return await adminApi.updateBanner(editingBanner.id, formData);
      }
      return await adminApi.createBanner(formData);
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      showToast(
        editingBanner
          ? `Banner "${saved.title}" updated successfully.`
          : `Banner "${saved.title}" created successfully.`,
        'success',
      );
      closeModal();
    },
    onError: (err) => {
      const apiErr = err as unknown as ApiError;
      setFormError(apiErr.message || 'Failed to save banner. Please try again.');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ id }: { id: string; title: string }) => {
      await adminApi.deleteBanner(id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      showToast(`Banner "${variables.title}" removed.`, 'success');
      setDeletingBanner(null);
    },
    onError: (err) => {
      const apiErr = err as unknown as ApiError;
      showToast(apiErr.message || 'Could not delete banner.', 'error');
      setDeletingBanner(null);
    },
  });

  const onSubmit = (values: BannerFormValues) => {
    setFormError(null);
    if (!editingBanner && !desktopFile) {
      setFileError('Desktop banner image is required for new banners.');
      return;
    }
    saveMutation.mutate(values);
  };

  // Filtered and Sorted Banners
  const filteredBanners = banners
    .filter((banner) => {
      if (!statusFilter) return true;
      const status = getBannerStatus(banner);
      return status === statusFilter;
    })
    .sort((a, b) => {
      const orderA = a.displayOrder ?? 0;
      const orderB = b.displayOrder ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-maroon/75">
            Storefront promotions
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
            Hero Banners
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage carousel promotions, scheduled campaigns, and responsive artwork.
          </p>
        </div>
        <button
          className="button-primary inline-flex items-center gap-1.5 py-2.5 px-4 text-xs font-semibold"
          onClick={openCreateModal}
          type="button"
        >
          <Plus className="size-4" /> Add Banner
        </button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-3xl border border-beige bg-surface p-5 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink">Filter Status:</span>
          <select
            aria-label="Filter by banner status"
            className="form-input text-xs py-1.5 px-3 max-w-xs"
            onChange={(e) => setStatusFilter(e.target.value)}
            value={statusFilter}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="EXPIRED">Expired</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
        <span className="text-xs text-muted">
          Showing {filteredBanners.length} of {banners.length} banners
        </span>
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
              <p className="font-semibold">Unable to load banners</p>
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

      {/* Banners List */}
      <div className="rounded-3xl border border-beige bg-surface p-6 shadow-soft sm:p-8">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                className="flex items-center justify-between py-4 border-b border-beige/60"
                key={i}
              >
                <Skeleton className="h-16 w-32 rounded-xl" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        ) : filteredBanners.length === 0 ? (
          <div className="py-12 text-center">
            <ImageIcon aria-hidden="true" className="mx-auto size-10 text-muted" />
            <h2 className="mt-3 font-display text-lg text-ink">No banners found</h2>
            <p className="mt-1 text-xs text-muted max-w-sm mx-auto">
              Create a banner to highlight collections, festive sales, or craft stories on your homepage.
            </p>
            <button
              className="button-primary mt-5 inline-flex items-center gap-1.5 py-2 px-4 text-xs"
              onClick={openCreateModal}
              type="button"
            >
              <Plus className="size-3.5" /> Add First Banner
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-beige text-[0.7rem] font-bold uppercase tracking-wider text-muted">
                <tr>
                  <th className="py-3 px-3">Order</th>
                  <th className="py-3 px-3">Preview</th>
                  <th className="py-3 px-3">Title & Destination</th>
                  <th className="py-3 px-3">Schedule (IST)</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/60">
                {filteredBanners.map((banner) => {
                  const status = getBannerStatus(banner);
                  const target = banner.targetLink || banner.targetUrl;

                  return (
                    <tr className="hover:bg-rose/5 transition-colors" key={banner.id}>
                      <td className="py-4 px-3 font-mono text-xs text-muted">
                        {banner.displayOrder ?? 0}
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2">
                          <div className="relative h-12 w-24 shrink-0 overflow-hidden rounded-lg bg-beige border border-beige">
                            <img
                              alt={banner.imageAlt || banner.title}
                              className="size-full object-cover"
                              src={banner.desktopImageUrl}
                            />
                            <span className="absolute bottom-0 inset-x-0 bg-ink/75 text-white text-[0.55rem] text-center font-semibold">
                              Desktop
                            </span>
                          </div>
                          {banner.mobileImageUrl && (
                            <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-beige border border-beige">
                              <img
                                alt={`${banner.title} mobile`}
                                className="size-full object-cover"
                                src={banner.mobileImageUrl}
                              />
                              <span className="absolute bottom-0 inset-x-0 bg-ink/75 text-white text-[0.55rem] text-center font-semibold">
                                Mobile
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-3 min-w-[12rem]">
                        <p className="font-semibold text-ink line-clamp-1">{banner.title}</p>
                        {banner.subtitle && (
                          <p className="text-xs text-muted line-clamp-1">{banner.subtitle}</p>
                        )}
                        {target && (
                          <span className="inline-flex items-center gap-1 font-mono text-[0.7rem] text-maroon mt-0.5">
                            <ExternalLink className="size-3" /> {target}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-3 text-xs text-muted whitespace-nowrap">
                        {banner.startAt || banner.endAt ? (
                          <div>
                            <span className="block">
                              From: {formatISTCompact(banner.startAt) || 'Immediate'}
                            </span>
                            <span className="block">
                              Until: {formatISTCompact(banner.endAt) || 'Indefinite'}
                            </span>
                          </div>
                        ) : (
                          <span>Always Active</span>
                        )}
                      </td>
                      <td className="py-4 px-3">
                        <BannerStatusBadge status={status} />
                      </td>
                      <td className="py-4 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            aria-label={`Edit ${banner.title}`}
                            className="grid size-8 place-items-center rounded-full text-muted hover:bg-rose/20 hover:text-maroon focus-visible:outline focus-visible:outline-2 focus-visible:outline-maroon"
                            onClick={() => openEditModal(banner)}
                            type="button"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button
                            aria-label={`Delete ${banner.title}`}
                            className="grid size-8 place-items-center rounded-full text-muted hover:bg-rose/20 hover:text-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-600"
                            onClick={() => setDeletingBanner(banner)}
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

      {/* Add / Edit Banner Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={closeModal}
        >
          <div
            aria-modal="true"
            className="w-full max-w-2xl rounded-3xl border border-beige bg-surface p-6 shadow-xl sm:p-8 my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <div className="flex items-center justify-between border-b border-beige pb-4">
              <h2 className="font-display text-2xl font-bold text-ink">
                {editingBanner ? 'Edit Hero Banner' : 'Add New Hero Banner'}
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

            {/* Dimension Guidance Alert */}
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-amber-800">
                <Info className="size-4 shrink-0" /> Recommended Banner Dimensions
              </div>
              <p>
                <strong>Desktop:</strong> 1920 × 600 px (ratio ~16:5) • <strong>Mobile:</strong> 1080 × 1350 px (ratio 4:5). Max 5 MB per image.
              </p>
              <p className="text-[0.7rem] text-amber-700 italic">
                “Keep important text and subjects inside the central safe area because image edges may be cropped on different devices.”
              </p>
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

            {fileError && (
              <div
                className="mt-4 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800"
                role="alert"
              >
                <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
                <p>{fileError}</p>
              </div>
            )}

            <form className="mt-5 space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
              {/* Title */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="banner-title">
                  Banner title <span className="text-maroon">*</span>
                </label>
                <input
                  {...register('title')}
                  aria-describedby={errors.title ? 'banner-title-error' : undefined}
                  aria-invalid={Boolean(errors.title)}
                  className="form-input text-sm"
                  id="banner-title"
                  placeholder="e.g. Festive Sparkle Collection"
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-maroon" id="banner-title-error" role="alert">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Subtitle */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="banner-subtitle">
                  Subtitle <span className="text-muted font-normal">(optional, max 500)</span>
                </label>
                <textarea
                  {...register('subtitle')}
                  aria-describedby={errors.subtitle ? 'banner-subtitle-error' : undefined}
                  aria-invalid={Boolean(errors.subtitle)}
                  className="form-input text-sm min-h-[3.5rem] resize-y"
                  id="banner-subtitle"
                  placeholder="Short tagline or promotion summary"
                  rows={2}
                />
                {errors.subtitle && (
                  <p className="mt-1 text-xs text-maroon" id="banner-subtitle-error" role="alert">
                    {errors.subtitle.message}
                  </p>
                )}
              </div>

              {/* Button Text & Target Link Row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="banner-btn">
                    Button label <span className="text-muted font-normal">(optional)</span>
                  </label>
                  <input
                    {...register('buttonText')}
                    aria-describedby={errors.buttonText ? 'banner-btn-error' : undefined}
                    aria-invalid={Boolean(errors.buttonText)}
                    className="form-input text-sm"
                    id="banner-btn"
                    placeholder="e.g. Shop Spring Pieces"
                  />
                  {errors.buttonText && (
                    <p className="mt-1 text-xs text-maroon" id="banner-btn-error" role="alert">
                      {errors.buttonText.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="banner-url">
                    Target destination URL
                  </label>
                  <input
                    {...register('targetUrl')}
                    aria-describedby={errors.targetUrl ? 'banner-url-error' : undefined}
                    aria-invalid={Boolean(errors.targetUrl)}
                    className="form-input text-sm"
                    id="banner-url"
                    placeholder="/products?category=earrings or https://..."
                  />
                  {errors.targetUrl && (
                    <p className="mt-1 text-xs text-maroon" id="banner-url-error" role="alert">
                      {errors.targetUrl.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Image Upload Row */}
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                {/* Desktop Artwork */}
                <div className="rounded-2xl border border-beige p-4 bg-[#fdfcfa] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                      <ImageIcon className="size-4 text-maroon" /> Desktop Artwork {!editingBanner && <span className="text-maroon">*</span>}
                    </span>
                    <span className="text-[0.68rem] text-muted">1920×600 px</span>
                  </div>

                  {desktopPreview ? (
                    <div className="relative aspect-[16/5] rounded-xl overflow-hidden bg-beige border border-beige">
                      <img alt="Desktop banner preview" className="size-full object-cover" src={desktopPreview} />
                    </div>
                  ) : null}

                  <input
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    id="desktop-banner-input"
                    onChange={handleDesktopFileChange}
                    ref={desktopInputRef}
                    type="file"
                  />
                  <label
                    className="button-secondary w-full justify-center text-xs cursor-pointer inline-flex items-center gap-1.5 py-1.5"
                    htmlFor="desktop-banner-input"
                  >
                    <Upload className="size-3.5" />
                    <span>{desktopPreview ? 'Change Desktop Image' : 'Select Desktop Image'}</span>
                  </label>
                </div>

                {/* Mobile Artwork */}
                <div className="rounded-2xl border border-beige p-4 bg-[#fdfcfa] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                      <Smartphone className="size-4 text-maroon" /> Mobile Artwork
                    </span>
                    <span className="text-[0.68rem] text-muted">1080×1350 px</span>
                  </div>

                  {mobilePreview ? (
                    <div className="relative aspect-[4/5] max-h-28 mx-auto rounded-xl overflow-hidden bg-beige border border-beige">
                      <img alt="Mobile banner preview" className="size-full object-cover" src={mobilePreview} />
                    </div>
                  ) : null}

                  <input
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    id="mobile-banner-input"
                    onChange={handleMobileFileChange}
                    ref={mobileInputRef}
                    type="file"
                  />
                  <label
                    className="button-secondary w-full justify-center text-xs cursor-pointer inline-flex items-center gap-1.5 py-1.5"
                    htmlFor="mobile-banner-input"
                  >
                    <Upload className="size-3.5" />
                    <span>{mobilePreview ? 'Change Mobile Image' : 'Select Mobile Image'}</span>
                  </label>
                </div>
              </div>

              {/* Scheduling Section */}
              <div className="rounded-2xl border border-beige p-4 bg-[#fdfcfa] space-y-3">
                <div className="flex items-center justify-between border-b border-beige/80 pb-2">
                  <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                    <Calendar className="size-4 text-maroon" /> Campaign Schedule (India Standard Time - IST)
                  </span>
                  <span className="rounded-full bg-maroon/10 px-2 py-0.5 text-[0.65rem] font-bold text-maroon">
                    UTC+05:30
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-ink font-medium" htmlFor="banner-start">
                      Start date & time (IST)
                    </label>
                    <input
                      {...register('startAt')}
                      aria-describedby={errors.startAt ? 'banner-start-error' : undefined}
                      aria-invalid={Boolean(errors.startAt)}
                      className="form-input text-xs"
                      id="banner-start"
                      type="datetime-local"
                    />
                    {errors.startAt && (
                      <p className="mt-1 text-xs text-maroon" id="banner-start-error" role="alert">
                        {errors.startAt.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-ink font-medium" htmlFor="banner-end">
                      End date & time (IST)
                    </label>
                    <input
                      {...register('endAt')}
                      aria-describedby={errors.endAt ? 'banner-end-error' : undefined}
                      aria-invalid={Boolean(errors.endAt)}
                      className="form-input text-xs"
                      id="banner-end"
                      type="datetime-local"
                    />
                    {errors.endAt && (
                      <p className="mt-1 text-xs text-maroon" id="banner-end-error" role="alert">
                        {errors.endAt.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Display Order & Active Toggle */}
              <div className="grid gap-4 sm:grid-cols-2 items-center pt-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="banner-order">
                    Display sequence
                  </label>
                  <input
                    {...register('displayOrder', { valueAsNumber: true })}
                    aria-describedby={errors.displayOrder ? 'banner-order-error' : undefined}
                    aria-invalid={Boolean(errors.displayOrder)}
                    className="form-input text-sm"
                    id="banner-order"
                    min={0}
                    type="number"
                  />
                  {errors.displayOrder && (
                    <p className="mt-1 text-xs text-maroon" id="banner-order-error" role="alert">
                      {errors.displayOrder.message}
                    </p>
                  )}
                </div>

                <label className="flex items-center gap-3 cursor-pointer sm:mt-6">
                  <input
                    {...register('active')}
                    className="size-4 rounded border-beige text-maroon focus:ring-maroon"
                    id="banner-active"
                    type="checkbox"
                  />
                  <div>
                    <span className="text-sm font-semibold text-ink block">Active flag</span>
                    <span className="text-[0.68rem] text-muted">Uncheck to immediately hide this banner</span>
                  </div>
                </label>
              </div>

              {/* Modal Actions */}
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
                  ) : editingBanner ? (
                    'Update Banner'
                  ) : (
                    'Create Banner'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        confirmLabel="Remove Banner"
        description={`Are you sure you want to remove "${deletingBanner?.title}"? It will no longer be displayed on the storefront.`}
        isOpen={Boolean(deletingBanner)}
        onClose={() => setDeletingBanner(null)}
        onConfirm={() =>
          deletingBanner &&
          deleteMutation.mutate({ id: deletingBanner.id, title: deletingBanner.title })
        }
        title="Remove Hero Banner"
      />
    </div>
  );
};

export default AdminBannersPage;
