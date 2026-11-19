import { API_BASE_URL } from "./api-config";
import type {
  ServicesResponse,
  SingleServiceResponse,
  Service,
  CreateServiceInput,
  UpdateServiceInput,
  ImageUploadResponse,
  ImageUploadData,
} from "@/types";

export interface FetchServicesParams {
  search?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
  status?: string;
}

/**
 * Fetches public active services from GET /api/services.
 * Supports search, category filter, price/name sorting, and pagination.
 */
export async function fetchServices(
  params: FetchServicesParams = {}
): Promise<ServicesResponse> {
  const url = new URL(`${API_BASE_URL}/api/services`);

  if (params.search && params.search.trim()) {
    url.searchParams.set("search", params.search.trim());
  }
  if (params.category && params.category !== "All") {
    url.searchParams.set("category", params.category.trim());
  }
  if (params.sort) {
    url.searchParams.set("sort", params.sort);
  }
  if (params.page && params.page > 1) {
    url.searchParams.set("page", params.page.toString());
  }
  if (params.limit) {
    url.searchParams.set("limit", params.limit.toString());
  }
  if (params.status) {
    url.searchParams.set("status", params.status);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch services (HTTP ${response.status})`
    );
  }

  return response.json();
}

/**
 * Fetches a single active service by its MongoDB ObjectId from GET /api/services/:id.
 */
export async function fetchServiceById(id: string): Promise<Service> {
  const response = await fetch(`${API_BASE_URL}/api/services/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
  });

  if (response.status === 404) {
    throw new Error("NOT_FOUND");
  }

  if (response.status === 400) {
    throw new Error("INVALID_ID");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch service details (HTTP ${response.status})`
    );
  }

  const result: SingleServiceResponse = await response.json();
  if (!result.data) {
    throw new Error("NOT_FOUND");
  }

  return result.data;
}

/**
 * Creates a new salon service (Admin Only).
 * POST /api/services
 */
export async function createService(data: CreateServiceInput): Promise<Service> {
  const response = await fetch(`${API_BASE_URL}/api/services`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const resJson = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      resJson.message || `Failed to create service (HTTP ${response.status})`
    );
  }

  return resJson.data;
}

/**
 * Updates an existing salon service (Admin Only).
 * PATCH /api/services/:id
 */
export async function updateService(
  id: string,
  data: UpdateServiceInput
): Promise<Service> {
  const response = await fetch(`${API_BASE_URL}/api/services/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const resJson = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      resJson.message || `Failed to update service (HTTP ${response.status})`
    );
  }

  return resJson.data;
}

/**
 * Toggles or updates the active status of a service (Admin Only).
 * PATCH /api/services/:id/status
 */
export async function updateServiceStatus(
  id: string,
  isActive: boolean
): Promise<Service> {
  const response = await fetch(`${API_BASE_URL}/api/services/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ isActive }),
  });

  const resJson = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      resJson.message || `Failed to update service status (HTTP ${response.status})`
    );
  }

  return resJson.data;
}

/**
 * Deletes a service permanently (Admin Only).
 * DELETE /api/services/:id
 */
export async function deleteService(id: string): Promise<{ id: string }> {
  const response = await fetch(`${API_BASE_URL}/api/services/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const resJson = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      resJson.message || `Failed to delete service (HTTP ${response.status})`
    );
  }

  return resJson.data || { id };
}

/**
 * Uploads an image file to ImgBB via backend endpoint (Admin Only).
 * POST /api/uploads/service-image
 *
 * Requirements:
 * - Uses FormData
 * - Exact multipart field name 'image'
 * - Does NOT manually set Content-Type header
 * - Includes credentials for Better Auth session
 */
export async function uploadServiceImage(file: File): Promise<ImageUploadData> {
  // Validate file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type.toLowerCase())) {
    throw new Error("Invalid file type. Only JPEG, JPG, PNG, and WebP images are allowed.");
  }

  // Validate file size (5MB max)
  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error("Image file exceeds the 5 MB maximum size limit.");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE_URL}/api/uploads/service-image`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const resJson: ImageUploadResponse = await response.json().catch(() => ({
    success: false,
    message: "Invalid server response",
  }));

  if (!response.ok || !resJson.success || !resJson.data) {
    throw new Error(
      resJson.message || `Image upload failed (HTTP ${response.status})`
    );
  }

  return resJson.data;
}
