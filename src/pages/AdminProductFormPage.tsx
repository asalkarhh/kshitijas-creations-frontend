import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Film,
  Loader2,
  Trash2,
  Upload,
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../api/admin';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { Skeleton } from '../components/common/Skeleton';
import { useToast } from '../components/common/Toast';
import { usePageMetadata } from '../hooks/use-page-metadata';
import { productSchema, type ProductFormValues } from '../schemas/admin';
import type { ApiError, ProductMedia } from '../types';

interface PendingUpload {
  file: File;
  previewUrl: string;
  altText: string;
  isPrimary: boolean;
  displayOrder: number;
  isVideo: boolean;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_SIZE_BYTES = 30 * 1024 * 1024; // 30 MB

const AdminProductFormPage = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  usePageMetadata({
    title: isEditing ? 'Edit product' : 'Add product',
    description: isEditing
      ? 'Update product details, pricing, and media assets.'
      : 'Add a new handcrafted piece to the catalog.',
    canonicalPath: isEditing ? `/admin/products/${id}/edit` : '/admin/products/new',
  });

  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingMedia, setDeletingMedia] = useState<ProductMedia | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [settingPrimaryMedia, setSettingPrimaryMedia] = useState<string | null>(null);
  const [pendingDeletedMediaIds, setPendingDeletedMediaIds] = useState<string[]>([]);
  const [pendingPrimaryMediaId, setPendingPrimaryMediaId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Categories list for dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: adminApi.getCategories,
    staleTime: 60_000,
  });

  // Product query for edit mode
  const {
    data: existingProduct,
    isLoading: isProductLoading,
    isError: isProductError,
    error: productFetchError,
  } = useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: () => adminApi.getProduct(id!),
    enabled: isEditing,
    staleTime: 30_000,
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      categoryId: '',
      name: '',
      productCode: '',
      shortDescription: '',
      description: '',
      price: 0,
      available: true,
      featured: false,
      instagramUrl: '',
      displayOrder: 0,
    },
  });

  // Prepopulate form on edit
  useEffect(() => {
    if (existingProduct) {
      reset({
        categoryId: existingProduct.category?.id || existingProduct.categoryId || '',
        name: existingProduct.name,
        productCode: existingProduct.productCode || '',
        shortDescription: existingProduct.shortDescription || '',
        description: existingProduct.description || '',
        price: existingProduct.price,
        available: existingProduct.isAvailable ?? existingProduct.available ?? true,
        featured: existingProduct.isFeatured ?? existingProduct.featured ?? false,
        instagramUrl: existingProduct.instagramUrl || '',
        displayOrder: existingProduct.displayOrder ?? 0,
      });
    }
  }, [existingProduct, reset]);

  // Warn before unload if unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty || pendingUploads.length > 0 || pendingDeletedMediaIds.length > 0 || pendingPrimaryMediaId) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, pendingUploads.length]);

  // Prevent browser default drop behavior (which opens images in new tabs) across the page
  useEffect(() => {
    const preventDefaults = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    window.addEventListener('dragover', preventDefaults);
    window.addEventListener('drop', preventDefaults);

    return () => {
      window.removeEventListener('dragover', preventDefaults);
      window.removeEventListener('drop', preventDefaults);
    };
  }, []);

  // File selection, drag & drop, and validation
  const processFiles = (files: FileList | File[]) => {
    setFileError(null);
    if (!files || files.length === 0) return;

    const newUploads: PendingUpload[] = [];
    const errorsList: string[] = [];

    Array.from(files).forEach((file) => {
      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

      if (!isImage && !isVideo) {
        errorsList.push(`"${file.name}" is not a supported image (JPEG/PNG/WebP) or video (MP4/WebM).`);
        return;
      }

      if (isImage && file.size > MAX_IMAGE_SIZE_BYTES) {
        errorsList.push(`"${file.name}" exceeds the 5 MB limit for images.`);
        return;
      }

      if (isVideo && file.size > MAX_VIDEO_SIZE_BYTES) {
        errorsList.push(`"${file.name}" exceeds the 30 MB limit for videos.`);
        return;
      }

      newUploads.push({
        file,
        previewUrl: URL.createObjectURL(file),
        altText: '',
        isPrimary: pendingUploads.length === 0 && newUploads.length === 0 && !existingProduct?.media?.length,
        displayOrder: (existingProduct?.media?.length ?? 0) + pendingUploads.length + newUploads.length + 1,
        isVideo,
      });
    });

    if (errorsList.length > 0) {
      setFileError(errorsList.join(' '));
    }

    if (newUploads.length > 0) {
      setPendingUploads((prev) => [...prev, ...newUploads]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removePendingUpload = (index: number) => {
    setPendingUploads((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].previewUrl);
      next.splice(index, 1);
      return next;
    });
  };

  // Upload media helper
  const uploadPendingMedia = async (productId: string, uploads: PendingUpload[]) => {
    if (uploads.length === 0) return true;
    setIsUploadingMedia(true);
    let anyFailed = false;

    for (const upload of uploads) {
      const formData = new FormData();
      formData.append('files', upload.file);
      formData.append('mediaType', upload.isVideo ? 'VIDEO' : 'IMAGE');
      formData.append('altText', upload.altText || upload.file.name);
      formData.append('primaryMedia', String(upload.isPrimary));
      formData.append('displayOrder', String(upload.displayOrder));

      try {
        await adminApi.uploadMedia(productId, formData);
      } catch (uploadErr) {
        anyFailed = true;
        const msg =
          (uploadErr as unknown as ApiError).message || `Failed to upload ${upload.file.name}`;
        showToast(msg, 'error');
      }
    }

    setIsUploadingMedia(false);
    return !anyFailed;
  };

  // Save product details & media
  const onSubmit = async (formValues: ProductFormValues) => {
    setFormError(null);

    const payload = {
      categoryId: formValues.categoryId,
      name: formValues.name.trim(),
      productCode: formValues.productCode.trim(),
      shortDescription: formValues.shortDescription?.trim() || undefined,
      description: formValues.description.trim(),
      price: Number(formValues.price),
      available: Boolean(formValues.available),
      featured: Boolean(formValues.featured),
      instagramUrl: formValues.instagramUrl?.trim() || undefined,
      displayOrder: Number(formValues.displayOrder ?? 0),
    };

    let targetProductId = id;

    try {
      if (isEditing && targetProductId) {
        await adminApi.updateProduct(targetProductId, payload);
        showToast(`Product "${formValues.name}" details updated.`, 'success');
      } else {
        const created = await adminApi.createProduct(payload);
        targetProductId = created.id;
        showToast(`Product "${created.name}" created successfully.`, 'success');
      }

      // Upload any selected media files
      if (pendingUploads.length > 0 && targetProductId) {
        const uploadSuccess = await uploadPendingMedia(targetProductId, pendingUploads);
        if (uploadSuccess) {
          setPendingUploads([]);
        }
      }

      // Apply saved-media changes only after the product Save Changes request succeeds.
      if (targetProductId) {
        for (const mediaId of pendingDeletedMediaIds) {
          await adminApi.deleteMedia(targetProductId, mediaId);
        }
        if (pendingPrimaryMediaId) {
          await adminApi.setPrimaryMedia(targetProductId, pendingPrimaryMediaId);
        }
        setPendingDeletedMediaIds([]);
        setPendingPrimaryMediaId(null);
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      if (targetProductId) {
        queryClient.invalidateQueries({ queryKey: ['admin', 'product', targetProductId] });
      }

      if (targetProductId) {
        navigate('/admin/products', { replace: true });
      }
    } catch (err) {
      const error = err as unknown as ApiError;
      if (error.fieldErrors) {
        Object.entries(error.fieldErrors).forEach(([field, msg]) => {
          if (field in formValues) {
            setError(field as keyof ProductFormValues, {
              type: 'server',
              message: msg,
            });
          }
        });
      }
      setFormError(error.message || 'Failed to save product. Please verify fields and try again.');
    }
  };

  // Delete existing media mutation
  const deleteMediaMutation = useMutation({
    mutationFn: async (media: ProductMedia) => {
      if (!id) return;
      await adminApi.deleteMedia(id, media.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showToast('Media asset removed.', 'success');
      setDeletingMedia(null);
    },
    onError: (err) => {
      const apiErr = err as unknown as ApiError;
      showToast(apiErr.message || 'Could not remove media asset.', 'error');
      setDeletingMedia(null);
    },
  });

  const setPrimaryMedia = async (media: ProductMedia) => {
    if (!id || media.isPrimary) return;
    setSettingPrimaryMedia(media.id);
    try {
      await adminApi.setPrimaryMedia(id, media.id);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'product', id] });
      showToast('Primary product image updated.', 'success');
    } catch (err) {
      showToast((err as ApiError).message || 'Could not update the primary image.', 'error');
    } finally {
      setSettingPrimaryMedia(null);
    }
  };

  if (isEditing && isProductLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="rounded-3xl border border-beige bg-surface p-8 shadow-soft space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-1/2" />
        </div>
      </div>
    );
  }

  if (isEditing && isProductError) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center" role="alert">
        <AlertCircle className="mx-auto size-12 text-rose-600" />
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">Product Not Found</h1>
        <p className="mt-2 text-sm text-muted">
          {(productFetchError as Error)?.message || 'The requested product does not exist or has been removed.'}
        </p>
        <Link className="button-primary mt-6 inline-flex items-center gap-2" to="/admin/products">
          <ArrowLeft className="size-4" /> Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-maroon hover:underline mb-2"
            to="/admin/products"
          >
            <ArrowLeft className="size-3.5" /> Back to products
          </Link>
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
            {isEditing ? `Edit: ${existingProduct?.name}` : 'Add New Product'}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {isEditing
              ? 'Update catalog details, pricing, availability, and multimedia assets.'
              : 'Add product descriptions, pricing, and upload images/videos.'}
          </p>
        </div>
        {isEditing && (
          <Link
            className="button-secondary inline-flex items-center gap-1.5 py-2 px-4 text-xs font-semibold"
            target="_blank"
            to={`/products/${existingProduct?.slug}`}
          >
            <span>Preview in Store</span>
            <ExternalLink className="size-3.5" />
          </Link>
        )}
      </div>

      {/* Error banner */}
      {formError && (
        <div
          className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"
          role="alert"
        >
          <AlertCircle className="size-5 shrink-0 text-rose-600 mt-0.5" />
          <p className="flex-1">{formError}</p>
        </div>
      )}

      {/* Form & Media Management Grid */}
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
          {/* Main Details */}
          <div className="rounded-3xl border border-beige bg-surface p-6 shadow-soft sm:p-8 space-y-5">
            <h2 className="font-display text-xl font-bold text-ink border-b border-beige pb-4">
              General Information
            </h2>

            {/* Product Name */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="product-name">
                Product name <span className="text-maroon">*</span>
              </label>
              <input
                {...register('name')}
                aria-describedby={errors.name ? 'product-name-error' : undefined}
                aria-invalid={Boolean(errors.name)}
                className="form-input text-sm"
                id="product-name"
                placeholder="e.g. Vintage Pearl Drop Earrings"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-maroon" id="product-name-error" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Product Code & Category Row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="product-code">
                  Product code / SKU <span className="text-maroon">*</span>
                </label>
                <input
                  {...register('productCode')}
                  aria-describedby={errors.productCode ? 'product-code-error' : undefined}
                  aria-invalid={Boolean(errors.productCode)}
                  className="form-input text-sm font-mono uppercase"
                  id="product-code"
                  placeholder="e.g. ER-01"
                />
                {errors.productCode && (
                  <p className="mt-1 text-xs text-maroon" id="product-code-error" role="alert">
                    {errors.productCode.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="product-cat">
                  Category <span className="text-maroon">*</span>
                </label>
                <select
                  {...register('categoryId')}
                  aria-describedby={errors.categoryId ? 'product-cat-error' : undefined}
                  aria-invalid={Boolean(errors.categoryId)}
                  className="form-input text-sm"
                  id="product-cat"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-xs text-maroon" id="product-cat-error" role="alert">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>
            </div>

            {/* Price & Display Order Row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="product-price">
                  Price (INR) <span className="text-maroon">*</span>
                </label>
                <input
                  {...register('price', { valueAsNumber: true })}
                  aria-describedby={errors.price ? 'product-price-error' : undefined}
                  aria-invalid={Boolean(errors.price)}
                  className="form-input text-sm"
                  id="product-price"
                  min={0}
                  placeholder="e.g. 750"
                  step="0.01"
                  type="number"
                />
                {errors.price && (
                  <p className="mt-1 text-xs text-maroon" id="product-price-error" role="alert">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="product-order">
                  Display order
                </label>
                <input
                  {...register('displayOrder', { valueAsNumber: true })}
                  aria-describedby={errors.displayOrder ? 'product-order-error' : undefined}
                  aria-invalid={Boolean(errors.displayOrder)}
                  className="form-input text-sm"
                  id="product-order"
                  min={0}
                  type="number"
                />
                {errors.displayOrder && (
                  <p className="mt-1 text-xs text-maroon" id="product-order-error" role="alert">
                    {errors.displayOrder.message}
                  </p>
                )}
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="product-short-desc">
                Short description <span className="text-muted font-normal">(card preview, max 500)</span>
              </label>
              <textarea
                {...register('shortDescription')}
                aria-describedby={errors.shortDescription ? 'product-short-desc-error' : undefined}
                aria-invalid={Boolean(errors.shortDescription)}
                className="form-input text-sm min-h-[3.5rem] resize-y"
                id="product-short-desc"
                placeholder="Brief summary displayed on product cards"
                rows={2}
              />
              {errors.shortDescription && (
                <p className="mt-1 text-xs text-maroon" id="product-short-desc-error" role="alert">
                  {errors.shortDescription.message}
                </p>
              )}
            </div>

            {/* Full Description */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="product-desc">
                Full description <span className="text-maroon">*</span>
              </label>
              <textarea
                {...register('description')}
                aria-describedby={errors.description ? 'product-desc-error' : undefined}
                aria-invalid={Boolean(errors.description)}
                className="form-input text-sm min-h-[12rem] resize-y leading-relaxed"
                id="product-desc"
                placeholder={'Write complete product details here. Use a new line for each point, for example:\n• Hand-painted clay diyas\n• Perfect for Diwali gifting'}
                rows={8}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-maroon" id="product-desc-error" role="alert">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Instagram Link */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink" htmlFor="product-insta">
                Instagram URL <span className="text-muted font-normal">(optional Reel or Post link)</span>
              </label>
              <input
                {...register('instagramUrl')}
                aria-describedby={errors.instagramUrl ? 'product-insta-error' : undefined}
                aria-invalid={Boolean(errors.instagramUrl)}
                className="form-input text-sm"
                id="product-insta"
                placeholder="https://www.instagram.com/p/..."
                type="url"
              />
              {errors.instagramUrl && (
                <p className="mt-1 text-xs text-maroon" id="product-insta-error" role="alert">
                  {errors.instagramUrl.message}
                </p>
              )}
            </div>

            {/* Stock and Featured Toggles */}
            <div className="border-t border-beige pt-5 grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  {...register('available')}
                  className="size-4 rounded border-beige text-maroon focus:ring-maroon"
                  id="product-available"
                  type="checkbox"
                />
                <div>
                  <span className="text-sm font-semibold text-ink block">In Stock / Available</span>
                  <span className="text-xs text-muted">Customers can add this piece to their cart</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  {...register('featured')}
                  className="size-4 rounded border-beige text-maroon focus:ring-maroon"
                  id="product-featured"
                  type="checkbox"
                />
                <div>
                  <span className="text-sm font-semibold text-ink block">Featured Piece</span>
                  <span className="text-xs text-muted">Showcase in the homepage curated section</span>
                </div>
              </label>
            </div>
          </div>

          {/* Media Management Sidebar */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-beige bg-surface p-6 shadow-soft space-y-4">
              <div className="flex items-center justify-between border-b border-beige pb-3">
                <h2 className="font-display text-lg font-bold text-ink">Media Assets</h2>
                <span className="text-xs font-bold text-muted">
                  {(existingProduct?.media?.length ?? 0) + pendingUploads.length} files
                </span>
              </div>

              {/* Upload Drop/Button Area */}
              <div
                className={`rounded-2xl border-2 border-dashed p-5 text-center transition-colors ${
                  isDragging
                    ? 'border-maroon bg-maroon/5 ring-2 ring-maroon/20'
                    : 'border-beige hover:border-maroon/40'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                  className="sr-only"
                  id="media-upload-input"
                  multiple
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  type="file"
                />
                <label
                  className="cursor-pointer block space-y-2"
                  htmlFor="media-upload-input"
                >
                  <div className="mx-auto size-10 grid place-items-center rounded-full bg-rose/20 text-maroon">
                    <Upload className="size-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-maroon hover:underline">
                      Upload images or videos
                    </span>
                    <p className="text-[0.68rem] text-muted mt-1">
                      Images (JPEG/PNG/WebP, max 5 MB) or Videos (MP4/WebM, max 30 MB)
                    </p>
                  </div>
                </label>
              </div>

              {fileError && (
                <div
                  className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"
                  role="alert"
                >
                  <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
                  <p>{fileError}</p>
                </div>
              )}

              {/* Existing Media List */}
              {isEditing && existingProduct?.media && existingProduct.media.length > 0 && (
                <div className="space-y-3 pt-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">
                    Saved Media
                  </p>
                  <div className="space-y-2.5">
                    {existingProduct.media.filter((media) => !pendingDeletedMediaIds.includes(media.id)).map((media) => (
                      <div
                        className="flex items-center gap-3 rounded-2xl border border-beige p-2.5 bg-[#fdfcfa]"
                        key={media.id}
                      >
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-beige">
                          {media.url.endsWith('.mp4') || media.url.endsWith('.webm') ? (
                            <div className="grid size-full place-items-center bg-ink/10">
                              <Film className="size-6 text-maroon" />
                            </div>
                          ) : (
                            <img
                              alt={media.altText || 'Media preview'}
                              className="size-full object-cover"
                              src={media.url}
                            />
                          )}
                          {(media.isPrimary && !pendingPrimaryMediaId || pendingPrimaryMediaId === media.id) && (
                            <span className="absolute bottom-0 inset-x-0 bg-maroon/90 text-white text-[0.6rem] font-bold text-center py-0.5">
                              Primary
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-ink truncate">
                            {media.altText || 'Media Asset'}
                          </p>
                          <span className="text-[0.68rem] text-muted">
                            Order: {media.displayOrder ?? 1}
                          </span>
                        </div>

                        <button
                          className="text-[0.68rem] font-semibold text-maroon hover:underline disabled:opacity-50"
                          disabled={(media.isPrimary && !pendingPrimaryMediaId) || settingPrimaryMedia === media.id}
                          onClick={() => setPendingPrimaryMediaId(media.id)}
                          type="button"
                        >
                          {(media.isPrimary && !pendingPrimaryMediaId) || pendingPrimaryMediaId === media.id ? 'Primary' : 'Make primary'}
                        </button>

                        <button
                          aria-label={`Remove media asset ${media.altText || media.id}`}
                          className="grid size-8 place-items-center rounded-full text-muted hover:bg-rose/20 hover:text-rose-600"
                          onClick={() => setDeletingMedia(media)}
                          type="button"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Uploads List */}
              {pendingUploads.length > 0 && (
                <div className="space-y-3 pt-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-maroon">
                    Ready to Upload ({pendingUploads.length})
                  </p>
                  <div className="space-y-2.5">
                    {pendingUploads.map((upload, index) => (
                      <div
                        className="flex items-center gap-3 rounded-2xl border border-maroon/25 bg-rose/10 p-2.5"
                        key={index}
                      >
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-beige">
                          {upload.isVideo ? (
                            <video
                              className="size-full object-cover"
                              muted
                              playsInline
                              src={upload.previewUrl}
                            />
                          ) : (
                            <img
                              alt={upload.file.name}
                              className="size-full object-cover"
                              src={upload.previewUrl}
                            />
                          )}
                          {upload.isPrimary && (
                            <span className="absolute bottom-0 inset-x-0 bg-maroon text-white text-[0.6rem] font-bold text-center py-0.5">
                              Primary
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="text-xs font-semibold text-ink truncate">
                            {upload.file.name}
                          </p>
                          <p className="text-[0.65rem] text-muted">
                            {(upload.file.size / 1024 / 1024).toFixed(2)} MB •{' '}
                            {upload.isVideo ? 'Video' : 'Image'}
                          </p>
                          <input
                            aria-label={`Alt text for ${upload.file.name}`}
                            className="form-input text-xs py-1 px-2"
                            onChange={(e) => {
                              const updated = [...pendingUploads];
                              updated[index].altText = e.target.value;
                              setPendingUploads(updated);
                            }}
                            placeholder="Alt text / description"
                            type="text"
                            value={upload.altText}
                          />
                          <label className="flex items-center gap-1.5 text-[0.68rem] font-semibold text-maroon">
                            <input
                              checked={upload.isPrimary}
                              name="pending-primary-media"
                              onChange={() => {
                                setPendingUploads((current) =>
                                  current.map((item, itemIndex) => ({
                                    ...item,
                                    isPrimary: itemIndex === index,
                                  })),
                                );
                              }}
                              type="radio"
                            />
                            Use as primary
                          </label>
                        </div>

                        <button
                          aria-label={`Remove pending upload ${upload.file.name}`}
                          className="grid size-8 place-items-center rounded-full text-muted hover:bg-rose/20 hover:text-rose-600"
                          onClick={() => removePendingUpload(index)}
                          type="button"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Save Button Card */}
            <div className="rounded-3xl border border-beige bg-surface p-6 shadow-soft space-y-4">
              <button
                aria-busy={isSubmitting || isUploadingMedia}
                className="button-primary w-full justify-center min-h-12 text-sm inline-flex items-center gap-2"
                disabled={isSubmitting || isUploadingMedia}
                type="submit"
              >
                {isSubmitting || isUploadingMedia ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />{' '}
                    {isUploadingMedia ? 'Uploading media...' : 'Saving product...'}
                  </>
                ) : isEditing ? (
                  'Save Changes'
                ) : (
                  'Create Product'
                )}
              </button>

              <Link
                className="button-secondary w-full justify-center text-xs"
                to="/admin/products"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>

      {/* Delete Media Confirmation Dialog */}
      <ConfirmationDialog
        confirmLabel="Delete Media Asset"
        description="This media asset will be removed when you click Save Changes."
        isOpen={Boolean(deletingMedia)}
        onClose={() => setDeletingMedia(null)}
        onConfirm={() => {
          if (deletingMedia) {
            setPendingDeletedMediaIds((current) => [...current, deletingMedia.id]);
            setDeletingMedia(null);
          }
        }}
        title="Delete Media Asset"
      />
    </div>
  );
};

export default AdminProductFormPage;
