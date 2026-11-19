"use client";

import { useState, useRef, type ChangeEvent } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Upload,
  Image as ImageIcon,
  Loader2,
  X,
  Sparkles,
  ArrowLeft,
  DollarSign,
  Clock,
  Tag,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadServiceImage } from "@/lib/services-api";
import type { Service, CreateServiceInput } from "@/types";

const SUGGESTED_CATEGORIES = [
  "Hair",
  "Skin",
  "Nails",
  "Spa",
  "Bridal",
  "Makeup",
];

const serviceFormSchema = z.object({
  name: z
    .string()
    .min(2, "Service name must be at least 2 characters")
    .max(100, "Service name cannot exceed 100 characters"),
  category: z
    .string()
    .min(2, "Please select or specify a category"),
  shortDescription: z
    .string()
    .max(200, "Short description cannot exceed 200 characters")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters"),
  price: z
    .number({ message: "Price must be a valid number" })
    .min(0, "Price cannot be negative"),
  duration: z
    .number({ message: "Duration must be a valid number" })
    .min(1, "Duration must be at least 1 minute"),
  image: z
    .string()
    .optional()
    .or(z.literal("")),
  isActive: z.boolean(),
});

export type ServiceFormData = z.infer<typeof serviceFormSchema>;

interface ServiceFormProps {
  initialData?: Service | null;
  isEditing?: boolean;
  onSubmit: (data: CreateServiceInput) => Promise<void>;
  isSubmitting: boolean;
}

export function ServiceForm({
  initialData,
  isEditing = false,
  onSubmit,
  isSubmitting,
}: ServiceFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imgPreviewError, setImgPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      category: initialData?.category || "Hair",
      shortDescription: initialData?.shortDescription || "",
      description: initialData?.description || "",
      price: initialData?.price !== undefined ? initialData.price : 50,
      duration: initialData?.duration || initialData?.durationMinutes || 45,
      image: initialData?.image || "",
      isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    },
  });

  const currentImage = watch("image");
  const selectedCategory = watch("category");
  const isActive = watch("isActive");

  // Handle file selection and ImgBB upload
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error
    setUploadError(null);

    // Client-side MIME validation
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      const msg = "Invalid format. Only JPEG, PNG, and WebP images are supported.";
      setUploadError(msg);
      toast.error(msg);
      return;
    }

    // Client-side file size validation (5 MB)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      const msg = "File exceeds the 5 MB maximum size limit.";
      setUploadError(msg);
      toast.error(msg);
      return;
    }

    try {
      setIsUploading(true);
      const uploadData = await uploadServiceImage(file);
      const hostedUrl = uploadData.displayUrl || uploadData.url;
      setValue("image", hostedUrl, { shouldValidate: true });
      setImgPreviewError(false);
      toast.success("Image uploaded to ImgBB successfully!");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to upload image to ImgBB";
      setUploadError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setValue("image", "", { shouldValidate: true });
    setImgPreviewError(false);
    setUploadError(null);
  };

  const onFormSubmit = async (values: ServiceFormData) => {
    const payload: CreateServiceInput = {
      name: values.name.trim(),
      category: values.category.trim(),
      shortDescription: values.shortDescription?.trim() || "",
      description: values.description.trim(),
      price: Number(values.price),
      duration: Number(values.duration),
      image: values.image?.trim() || "",
      isActive: values.isActive,
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* Basic Service Info Section */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs sm:p-8">
        <div className="mb-6 border-b border-border pb-4">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            Treatment Details
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Basic treatment identification and client categorization.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Service Name */}
          <div className="sm:col-span-2">
            <label
              htmlFor="name"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5"
            >
              Service Name <span className="text-primary">*</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Signature Botanical Scalp Treatment"
              {...register("name")}
              disabled={isSubmitting}
              className={`w-full rounded-md border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 ${
                errors.name
                  ? "border-rose-400 focus-visible:ring-rose-400"
                  : "border-border focus-visible:ring-primary"
              }`}
            />
            {errors.name && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.name.message}</span>
              </p>
            )}
          </div>

          {/* Category */}
          <div className="sm:col-span-2">
            <label
              htmlFor="category"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5"
            >
              Category <span className="text-primary">*</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2.5">
              {SUGGESTED_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setValue("category", cat, { shouldValidate: true })}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedCategory?.toLowerCase() === cat.toLowerCase()
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border border-border bg-accent/40 text-foreground hover:bg-accent"
                  }`}
                >
                  <Tag className="h-3 w-3" />
                  <span>{cat}</span>
                </button>
              ))}
            </div>
            <input
              id="category"
              type="text"
              placeholder="Select above or type custom category"
              {...register("category")}
              disabled={isSubmitting}
              className={`w-full rounded-md border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 ${
                errors.category
                  ? "border-rose-400 focus-visible:ring-rose-400"
                  : "border-border focus-visible:ring-primary"
              }`}
            />
            {errors.category && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.category.message}</span>
              </p>
            )}
          </div>

          {/* Price */}
          <div>
            <label
              htmlFor="price"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5"
            >
              Price (USD) <span className="text-primary">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
              </span>
              <input
                id="price"
                type="number"
                step="1"
                min="0"
                placeholder="0"
                {...register("price", { valueAsNumber: true })}
                disabled={isSubmitting}
                className={`w-full rounded-md border bg-background pl-9 pr-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 ${
                  errors.price
                    ? "border-rose-400 focus-visible:ring-rose-400"
                    : "border-border focus-visible:ring-primary"
                }`}
              />
            </div>
            {errors.price && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.price.message}</span>
              </p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label
              htmlFor="duration"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5"
            >
              Duration (Minutes) <span className="text-primary">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <Clock className="h-4 w-4" />
              </span>
              <input
                id="duration"
                type="number"
                step="1"
                min="1"
                placeholder="45"
                {...register("duration", { valueAsNumber: true })}
                disabled={isSubmitting}
                className={`w-full rounded-md border bg-background pl-9 pr-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 ${
                  errors.duration
                    ? "border-rose-400 focus-visible:ring-rose-400"
                    : "border-border focus-visible:ring-primary"
                }`}
              />
            </div>
            {errors.duration && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.duration.message}</span>
              </p>
            )}
          </div>

          {/* Short Description */}
          <div className="sm:col-span-2">
            <label
              htmlFor="shortDescription"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5"
            >
              Short Summary / Tagline <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <input
              id="shortDescription"
              type="text"
              placeholder="Brief 1-sentence highlight shown in summary cards"
              {...register("shortDescription")}
              disabled={isSubmitting}
              className="w-full rounded-md border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          {/* Full Description */}
          <div className="sm:col-span-2">
            <label
              htmlFor="description"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5"
            >
              Full Treatment Description <span className="text-primary">*</span>
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="Detailed treatment narrative, process steps, organic product highlights, and benefits..."
              {...register("description")}
              disabled={isSubmitting}
              className={`w-full rounded-md border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 leading-relaxed ${
                errors.description
                  ? "border-rose-400 focus-visible:ring-rose-400"
                  : "border-border focus-visible:ring-primary"
              }`}
            />
            {errors.description && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.description.message}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Media & ImgBB Upload Section */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs sm:p-8">
        <div className="mb-6 border-b border-border pb-4">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            Service Imagery &amp; Media
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload a treatment showcase photograph via ImgBB or provide a hosted URL.
          </p>
        </div>

        <div className="space-y-6">
          {/* Image Preview & Upload Controls */}
          {currentImage && !imgPreviewError ? (
            <div className="relative rounded-lg border border-border bg-secondary/30 p-4">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="relative h-36 w-48 shrink-0 overflow-hidden rounded-md border border-border bg-background">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentImage}
                    alt="Service preview"
                    onError={() => setImgPreviewError(true)}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Active Image Configured</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono break-all line-clamp-2">
                    {currentImage}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || isSubmitting}
                      className="gap-1.5 text-xs"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Replace Image</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveImage}
                      disabled={isUploading || isSubmitting}
                      className="gap-1 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
                isUploading
                  ? "border-primary/50 bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-accent/20"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground mb-3">
                {isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : (
                  <Upload className="h-6 w-6" />
                )}
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                {isUploading ? "Uploading to ImgBB..." : "Click or drag treatment photo to upload"}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                Supported formats: JPEG, JPG, PNG, and WebP (up to 5 MB). Uploads directly to external ImgBB storage.
              </p>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading || isSubmitting}
          />

          {/* Upload Error Banner */}
          {uploadError && (
            <div
              role="alert"
              className="rounded-lg border border-rose-300 bg-rose-50/80 p-3.5 text-xs text-rose-900"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Image Upload Notice</p>
                  <p className="mt-0.5 text-rose-800 leading-relaxed">
                    {uploadError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Manual URL Input Alternative */}
          <div>
            <label
              htmlFor="image"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5"
            >
              Or Enter Image URL Directly
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <ImageIcon className="h-4 w-4" />
              </span>
              <input
                id="image"
                type="url"
                placeholder="https://images.unsplash.com/... or https://i.ibb.co/..."
                {...register("image")}
                disabled={isSubmitting || isUploading}
                onChange={(e) => {
                  setValue("image", e.target.value, { shouldValidate: true });
                  setImgPreviewError(false);
                }}
                className="w-full rounded-md border border-border bg-background pl-9 pr-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              You can paste an existing hosted image URL or use the ImgBB upload above.
            </p>
          </div>
        </div>
      </div>

      {/* Visibility Status Section */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              Publishing &amp; Availability
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Controls whether this treatment is publicly discoverable and bookable in the catalog.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              {...register("isActive")}
              disabled={isSubmitting}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Current status:{" "}
          <strong className={isActive ? "text-emerald-700 font-semibold" : "text-amber-700 font-semibold"}>
            {isActive ? "Active (Visible in Public Catalog)" : "Inactive (Hidden from Customers)"}
          </strong>
        </p>
      </div>

      {/* Form Submission Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Link href="/dashboard/admin/services">
          <Button
            type="button"
            variant="outline"
            size="md"
            disabled={isSubmitting || isUploading}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            <span>Cancel</span>
          </Button>
        </Link>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isSubmitting || isUploading}
          className="min-w-[140px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Sparkles className="mr-1.5 h-4 w-4" />
              <span>{isEditing ? "Update Service" : "Create Service"}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
