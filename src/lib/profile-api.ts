import { API_ENDPOINTS } from "./api-config";
import type {
  UserProfile,
  ProfileResponse,
  UpdateProfileInput,
  ImageUploadData,
  ImageUploadResponse,
} from "@/types";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

/**
 * Retrieves the current authenticated user's profile information.
 * GET /api/profile/me
 */
export async function getMyProfile(): Promise<UserProfile> {
  const response = await fetch(API_ENDPOINTS.PROFILE.ME, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
  });

  const resJson: ProfileResponse = await response.json().catch(() => ({
    success: false,
    message: "Invalid response from server",
    data: {
      id: "",
      name: "",
      email: "",
      image: null,
      phone: null,
      role: "customer",
      isBlocked: false,
      createdAt: "",
      updatedAt: "",
    },
  }));

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (response.status === 403) {
    throw new Error("FORBIDDEN: Account access suspended");
  }

  if (response.status === 404) {
    throw new Error("PROFILE_NOT_FOUND");
  }

  if (!response.ok || !resJson.success || !resJson.data) {
    throw new Error(
      resJson.message || `Failed to fetch profile (HTTP ${response.status})`
    );
  }

  return resJson.data;
}

/**
 * Updates the current authenticated user's permitted profile fields.
 * PATCH /api/profile/me
 *
 * Allowed fields: name, phone, image.
 * Strictly strips any forbidden fields (email, role, isBlocked, passwords, IDs).
 */
export async function updateMyProfile(
  data: UpdateProfileInput
): Promise<UserProfile> {
  // Whitelist only allowed fields to guarantee security
  const payload: UpdateProfileInput = {};

  if (data.name !== undefined) {
    payload.name = data.name.trim();
  }
  if (data.phone !== undefined) {
    payload.phone = data.phone ? data.phone.trim() : null;
  }
  if (data.image !== undefined) {
    payload.image = data.image ? data.image.trim() : null;
  }

  if (Object.keys(payload).length === 0) {
    throw new Error("No valid fields provided for update");
  }

  const response = await fetch(API_ENDPOINTS.PROFILE.ME, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const resJson: ProfileResponse = await response.json().catch(() => ({
    success: false,
    message: "Invalid response from server",
    data: {
      id: "",
      name: "",
      email: "",
      image: null,
      phone: null,
      role: "customer",
      isBlocked: false,
      createdAt: "",
      updatedAt: "",
    },
  }));

  if (response.status === 400) {
    throw new Error(resJson.message || "Invalid profile data submitted");
  }

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (response.status === 403) {
    throw new Error("FORBIDDEN: Account access suspended");
  }

  if (response.status === 404) {
    throw new Error("PROFILE_NOT_FOUND");
  }

  if (!response.ok || !resJson.success || !resJson.data) {
    throw new Error(
      resJson.message || `Failed to update profile (HTTP ${response.status})`
    );
  }

  return resJson.data;
}

/**
 * Uploads a profile image file to ImgBB via the backend endpoint.
 * POST /api/uploads/profile-image
 *
 * Enforces client-side type and 5MB size limits before transmission.
 */
export async function uploadProfileImage(file: File): Promise<ImageUploadData> {
  if (!file) {
    throw new Error("No image file selected");
  }

  // 1. Client-side MIME type validation
  const fileType = file.type.toLowerCase();
  if (!ALLOWED_IMAGE_TYPES.has(fileType)) {
    throw new Error(
      "Invalid image type. Please select a JPEG, PNG, or WebP image."
    );
  }

  // 2. Client-side size limit validation (5 MB)
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Image file size exceeds the 5 MB limit. Please select a smaller file.");
  }

  if (file.size === 0) {
    throw new Error("Selected image file is empty.");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(API_ENDPOINTS.UPLOADS.PROFILE_IMAGE, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const resJson: ImageUploadResponse = await response.json().catch(() => ({
    success: false,
    message: "Invalid response from image upload server",
    data: {
      url: "",
      displayUrl: "",
      deleteUrl: null,
      thumbUrl: null,
      title: "",
    },
  }));

  if (response.status === 400) {
    throw new Error(resJson.message || "Invalid image upload request");
  }

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED: Sign in required to upload profile image");
  }

  if (response.status === 403) {
    throw new Error("FORBIDDEN: Suspended accounts cannot upload profile photos");
  }

  if (response.status === 502 || response.status === 504) {
    throw new Error("Image hosting service is temporarily unavailable. Please try again shortly.");
  }

  if (!response.ok || !resJson.success || !resJson.data?.url) {
    throw new Error(
      resJson.message || `Failed to upload image (HTTP ${response.status})`
    );
  }

  return resJson.data;
}
