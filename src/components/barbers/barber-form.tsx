"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Upload,
  User as UserIcon,
  Loader2,
  X,
  Sparkles,
  ArrowLeft,
  Award,
  Tag,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadBarberImage } from "@/lib/barbers-api";
import { fetchServices } from "@/lib/services-api";
import type { Barber, CreateBarberInput, Service } from "@/types";

const barberFormSchema = z.object({
  name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),
  designation: z
    .string()
    .min(2, "Designation must be at least 2 characters (e.g. 'Master Stylist')")
    .max(100, "Designation cannot exceed 100 characters"),
  specializationInput: z
    .string()
    .min(2, "At least one specialization is required (comma-separated, e.g. 'Fade, Beard Trim')"),
  experience: z
    .number({ message: "Years of experience must be a number" })
    .min(0, "Experience cannot be negative"),
  bio: z
    .string()
    .max(500, "Bio cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  image: z
    .string()
    .optional()
    .or(z.literal("")),
  isActive: z.boolean(),
});

export type BarberFormData = z.infer<typeof barberFormSchema>;

interface BarberFormProps {
  initialData?: Barber | null;
  isEditing?: boolean;
  onSubmit: (data: CreateBarberInput) => Promise<void>;
  isSubmitting: boolean;
}

export function BarberForm({
  initialData,
  isEditing = false,
  onSubmit,
  isSubmitting,
}: BarberFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Available services for multi-selection
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    initialData?.serviceIds || []
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BarberFormData>({
    resolver: zodResolver(barberFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      designation: initialData?.designation || "",
      specializationInput: initialData?.specialization
        ? initialData.specialization.join(", ")
        : "",
      experience: initialData?.experience !== undefined ? initialData.experience : 3,
      bio: initialData?.bio || "",
      image: initialData?.image || "",
      isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    },
  });

  const currentImage = watch("image");
  const isActive = watch("isActive");

  // Fetch available services for associated services multi-select
  useEffect(() => {
    let isCurrent = true;
    async function loadServices() {
      try {
        const response = await fetchServices({ limit: 100 });
        if (isCurrent) {
          setAvailableServices(response.data || []);
          setIsLoadingServices(false);
        }
      } catch (err) {
        if (isCurrent) {
          console.warn("[BarberForm] Failed to load services for selection:", err);
          setIsLoadingServices(false);
        }
      }
    }
    loadServices();
    return () => {
      isCurrent = false;
    };
  }, []);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const uploadData = await uploadBarberImage(file);
      const url = uploadData.displayUrl || uploadData.url;
      setValue("image", url, { shouldValidate: true });
      toast.success("Profile image uploaded successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Image upload failed";
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const toggleServiceId = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleFormSubmit = async (formData: BarberFormData) => {
    // Parse specialization comma-separated string into clean array
    const specs = formData.specializationInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload: CreateBarberInput = {
      name: formData.name.trim(),
      designation: formData.designation.trim(),
      specialization: specs,
      experience: Number(formData.experience),
      bio: formData.bio?.trim() || "",
      image: formData.image?.trim() || "",
      serviceIds: selectedServiceIds,
      isActive: formData.isActive,
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* 1. Basic Information Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-2xs">
        <div className="flex items-center gap-2 pb-4 mb-6 border-b border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <UserIcon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Specialist Identity
            </h2>
            <p className="text-xs text-muted-foreground">
              Provide the barber or stylist&apos;s professional title and credentials.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="text-xs font-semibold text-foreground flex items-center justify-between"
            >
              <span>Full Name <span className="text-rose-500">*</span></span>
              <span className="text-[11px] font-normal text-muted-foreground">e.g. Julian Hayes</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Julian Hayes"
              {...register("name")}
              className={`w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                errors.name ? "border-rose-500" : "border-input"
              }`}
            />
            {errors.name && (
              <p className="text-xs text-rose-500">{errors.name.message}</p>
            )}
          </div>

          {/* Designation */}
          <div className="space-y-1.5">
            <label
              htmlFor="designation"
              className="text-xs font-semibold text-foreground flex items-center justify-between"
            >
              <span>Designation / Title <span className="text-rose-500">*</span></span>
              <span className="text-[11px] font-normal text-muted-foreground">e.g. Senior Master Stylist</span>
            </label>
            <input
              id="designation"
              type="text"
              placeholder="e.g. Master Stylist & Colorist"
              {...register("designation")}
              className={`w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                errors.designation ? "border-rose-500" : "border-input"
              }`}
            />
            {errors.designation && (
              <p className="text-xs text-rose-500">{errors.designation.message}</p>
            )}
          </div>

          {/* Specialization (Comma-Separated) */}
          <div className="space-y-1.5 sm:col-span-2">
            <label
              htmlFor="specializationInput"
              className="text-xs font-semibold text-foreground flex items-center justify-between"
            >
              <span>Specializations <span className="text-rose-500">*</span></span>
              <span className="text-[11px] font-normal text-muted-foreground">Separate with commas</span>
            </label>
            <div className="relative">
              <input
                id="specializationInput"
                type="text"
                placeholder="e.g. Scissor Fade, Beard Styling, Hot Towel Shave, Hair Coloring"
                {...register("specializationInput")}
                className={`w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  errors.specializationInput ? "border-rose-500" : "border-input"
                }`}
              />
            </div>
            {errors.specializationInput && (
              <p className="text-xs text-rose-500">{errors.specializationInput.message}</p>
            )}
            <p className="text-[11px] text-muted-foreground">
              These will render as stylish specialization tags on the specialist profile cards.
            </p>
          </div>

          {/* Years of Experience */}
          <div className="space-y-1.5">
            <label
              htmlFor="experience"
              className="text-xs font-semibold text-foreground flex items-center justify-between"
            >
              <span>Years of Experience <span className="text-rose-500">*</span></span>
              <span className="text-[11px] font-normal text-muted-foreground">Years in craft</span>
            </label>
            <div className="relative">
              <input
                id="experience"
                type="number"
                min="0"
                step="1"
                {...register("experience", { valueAsNumber: true })}
                className={`w-full rounded-md border bg-background px-3 py-2 pl-9 text-sm text-foreground transition-colors placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  errors.experience ? "border-rose-500" : "border-input"
                }`}
              />
              <Award className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            {errors.experience && (
              <p className="text-xs text-rose-500">{errors.experience.message}</p>
            )}
          </div>

          {/* Status Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Visibility Status
            </label>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setValue("isActive", !isActive, { shouldValidate: true })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive ? "bg-emerald-600" : "bg-neutral-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    isActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-xs font-medium text-foreground">
                {isActive ? "Active (Visible on Homepage & Public)" : "Inactive (Hidden)"}
              </span>
            </div>
          </div>

          {/* Short Bio */}
          <div className="space-y-1.5 sm:col-span-2">
            <label
              htmlFor="bio"
              className="text-xs font-semibold text-foreground flex items-center justify-between"
            >
              <span>Biography</span>
              <span className="text-[11px] font-normal text-muted-foreground">Up to 500 characters</span>
            </label>
            <textarea
              id="bio"
              rows={3}
              placeholder="e.g. Trained in Milan and London with over 8 years perfecting precision cuts, bespoke coloring, and luxury styling."
              {...register("bio")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-y"
            />
            {errors.bio && (
              <p className="text-xs text-rose-500">{errors.bio.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Profile Image & Media Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-2xs">
        <div className="flex items-center gap-2 pb-4 mb-6 border-b border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Upload className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Profile Photo
            </h2>
            <p className="text-xs text-muted-foreground">
              Upload a high-resolution portrait or supply a direct image URL.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
          {/* Image Preview Box */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-border bg-secondary/30 text-center">
            {currentImage ? (
              <div className="relative h-44 w-44 rounded-xl overflow-hidden border border-border bg-muted shadow-xs mb-3">
                <Image
                  src={currentImage}
                  alt="Barber Preview"
                  fill
                  sizes="176px"
                  className="object-cover object-top"
                  unoptimized={currentImage.startsWith("data:")}
                />
                <button
                  type="button"
                  onClick={() => setValue("image", "", { shouldValidate: true })}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-44 w-44 rounded-xl border border-border bg-muted/40 text-muted-foreground mb-3">
                <UserIcon className="h-12 w-12 opacity-40 mb-1" />
                <span className="text-[11px]">No Photo Selected</span>
              </div>
            )}
            <span className="text-[11px] text-muted-foreground">
              Recommended: 800x1000px portrait ratio
            </span>
          </div>

          {/* Upload Controls */}
          <div className="sm:col-span-2 space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-2">
                Upload via ImgBB
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="barber-image-file"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="gap-2 text-xs"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Uploading photo to ImgBB...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    <span>Select Local Photo (Max 5MB)</span>
                  </>
                )}
              </Button>
              {uploadError && (
                <p className="mt-1 text-xs text-rose-500">{uploadError}</p>
              )}
            </div>

            <div className="pt-2 border-t border-border/60">
              <label
                htmlFor="image-url"
                className="text-xs font-semibold text-foreground flex items-center justify-between mb-1"
              >
                <span>Or Enter Image URL Directly</span>
                <span className="text-[11px] font-normal text-muted-foreground">HTTPS URL</span>
              </label>
              <input
                id="image-url"
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                {...register("image")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Paste any valid hosted image URL (Unsplash, ImgBB, Cloudinary, etc.)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Associated Services Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-2xs">
        <div className="flex items-center gap-2 pb-4 mb-6 border-b border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Tag className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Associated Services
            </h2>
            <p className="text-xs text-muted-foreground">
              Select the treatments and services this specialist is certified to perform.
            </p>
          </div>
        </div>

        {isLoadingServices ? (
          <div className="flex items-center gap-2 py-6 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Loading treatment catalog...</span>
          </div>
        ) : availableServices.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-4">
            No services currently available in the catalog. You can create services under Manage Services.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableServices.map((service) => {
              const isSelected = selectedServiceIds.includes(service._id);
              return (
                <button
                  type="button"
                  key={service._id}
                  onClick={() => toggleServiceId(service._id)}
                  className={`flex items-start gap-3 p-3 text-left rounded-xl border transition-all text-xs ${
                    isSelected
                      ? "border-primary bg-accent/30 text-foreground ring-1 ring-primary/40"
                      : "border-border bg-background text-muted-foreground hover:border-border/80 hover:bg-muted/40"
                  }`}
                >
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border mt-0.5 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-muted-foreground/40 bg-background"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium line-clamp-1 ${isSelected ? "text-foreground font-semibold" : ""}`}>
                      {service.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      ${service.price} &bull; {service.duration} mins &bull; {service.category}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <span>{selectedServiceIds.length} service{selectedServiceIds.length !== 1 ? "s" : ""} selected</span>
          {selectedServiceIds.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedServiceIds([])}
              className="text-primary hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Form Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
        <Link href="/dashboard/admin/barbers">
          <Button variant="outline" size="md" type="button" disabled={isSubmitting}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span>Cancel</span>
          </Button>
        </Link>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting || isUploading}
            className="w-full sm:w-auto min-w-36"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Saving Barber...</span>
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                <span>{isEditing ? "Update Barber Profile" : "Create Barber Profile"}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
