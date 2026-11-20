"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Upload, X, Loader2, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadProfileImage, updateMyProfile } from "@/lib/profile-api";
import { useSession } from "@/lib/auth-client";
import type { UserProfile } from "@/types";

interface ProfileImageUploadProps {
  profile: UserProfile;
  onImageUpdated: (newImageUrl: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function ProfileImageUpload({ profile, onImageUpdated }: ProfileImageUploadProps) {
  const { refetch } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Clean up object URLs on change/unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const fileType = file.type.toLowerCase();
    if (!ALLOWED_TYPES.includes(fileType)) {
      toast.error("Invalid image format. Only JPEG, PNG, and WebP images are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image file size exceeds the 5MB limit. Please select a smaller photo.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Revoke previous blob preview if any
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
  };

  const handleCancelPreview = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadAndSave = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // 1. Upload to ImgBB via backend
      const uploadResult = await uploadProfileImage(selectedFile);
      const hostedUrl = uploadResult.displayUrl || uploadResult.url;

      if (!hostedUrl) {
        throw new Error("No image URL received from storage provider");
      }

      // 2. Persist new image URL to user's profile
      const updatedProfile = await updateMyProfile({ image: hostedUrl });

      // 3. Sync Better Auth session so Navbar and Dashboard reflect updated avatar
      await refetch?.();

      // 4. Dispatch global profile updated event
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("salonbook:profile-updated", { detail: updatedProfile })
        );
      }

      toast.success("Profile photo updated successfully");
      onImageUpdated(hostedUrl);
      handleCancelPreview();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload profile photo";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const activeImage = previewUrl || profile.image;

  return (
    <div className="flex flex-col items-center text-center p-6 bg-card rounded-2xl border border-border shadow-xs">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={isUploading || profile.isBlocked}
      />

      {/* Avatar Container with Local Preview */}
      <div className="relative group">
        <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-border shadow-sm bg-accent/40 flex items-center justify-center">
          {activeImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeImage}
              alt={profile.name || "User Avatar"}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="font-serif text-3xl font-bold text-accent-foreground">
              {profile.name ? profile.name.charAt(0).toUpperCase() : <UserIcon className="h-10 w-10 text-muted-foreground" />}
            </span>
          )}
        </div>

        {/* Change Photo Overlay Button */}
        {!profile.isBlocked && !selectedFile && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            aria-label="Upload new profile picture"
            className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground shadow-md transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            title="Upload new photo"
          >
            <Camera className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Helper Details & Preview State Controls */}
      <div className="mt-4 space-y-2 w-full">
        {selectedFile ? (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground block truncate max-w-[200px] mx-auto">
                {selectedFile.name}
              </span>
              <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB preview</span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleUploadAndSave}
                disabled={isUploading}
                className="text-xs gap-1.5"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    <span>Save Photo</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelPreview}
                disabled={isUploading}
                className="text-xs gap-1"
              >
                <X className="h-3.5 w-3.5" />
                <span>Cancel</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || profile.isBlocked}
                className="text-xs gap-1.5"
              >
                <Camera className="h-3.5 w-3.5 text-primary" />
                <span>{profile.image ? "Change Photo" : "Upload Photo"}</span>
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              JPG, PNG, or WebP. Max 5 MB.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
