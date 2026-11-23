import { API_ENDPOINTS } from "./api-config";
import type {
  Barber,
  BarbersResponse,
  SingleBarberResponse,
  CreateBarberInput,
  UpdateBarberInput,
  ImageUploadData,
  ImageUploadResponse,
} from "@/types";

export interface FetchBarbersParams {
  search?: string;
  serviceId?: string;
  status?: "all" | "active" | "inactive" | string;
  all?: boolean;
  populate?: "services" | "true" | string;
  includeServices?: boolean;
}

/**
 * Fetches barbers from GET /api/barbers.
 * - Public / Customer: retrieves active barbers only.
 * - Admin: can pass all=true or status="all" to inspect inactive barbers as well.
 */
export async function fetchBarbers(
  params: FetchBarbersParams = {}
): Promise<BarbersResponse> {
  const url = new URL(API_ENDPOINTS.BARBERS.BASE);

  if (params.search && params.search.trim()) {
    url.searchParams.set("search", params.search.trim());
  }
  if (params.serviceId && params.serviceId.trim()) {
    url.searchParams.set("serviceId", params.serviceId.trim());
  }
  if (params.status) {
    url.searchParams.set("status", params.status);
  }
  if (params.all) {
    url.searchParams.set("all", "true");
  }
  if (params.populate) {
    url.searchParams.set("populate", params.populate);
  }
  if (params.includeServices) {
    url.searchParams.set("includeServices", "true");
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
      errorData.message || `Failed to fetch barbers (HTTP ${response.status})`
    );
  }

  return response.json();
}

/**
 * Fetches an individual barber by ID from GET /api/barbers/:id.
 */
export async function fetchBarberById(
  id: string,
  params: { populate?: string; includeServices?: boolean } = {}
): Promise<Barber> {
  const url = new URL(API_ENDPOINTS.BARBERS.BY_ID(id));

  if (params.populate) {
    url.searchParams.set("populate", params.populate);
  }
  if (params.includeServices) {
    url.searchParams.set("includeServices", "true");
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
  });

  if (response.status === 404) {
    throw new Error("Barber not found");
  }
  if (response.status === 400) {
    throw new Error("Invalid barber ID format");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch barber (HTTP ${response.status})`
    );
  }

  const result: SingleBarberResponse = await response.json();
  if (!result.data) {
    throw new Error("Barber details unavailable");
  }

  return result.data;
}

/**
 * Creates a new barber document (Admin Only).
 * POST /api/barbers
 * Accepts either JSON CreateBarberInput or multipart FormData.
 */
export async function createBarber(
  data: CreateBarberInput | FormData
): Promise<Barber> {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(API_ENDPOINTS.BARBERS.BASE, {
    method: "POST",
    headers,
    credentials: "include",
    body: isFormData ? data : JSON.stringify(data),
  });

  const resJson = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      resJson.message || `Failed to create barber (HTTP ${response.status})`
    );
  }

  return resJson.data;
}

/**
 * Updates an existing barber document (Admin Only).
 * PATCH /api/barbers/:id
 * Accepts either JSON UpdateBarberInput or multipart FormData.
 */
export async function updateBarber(
  id: string,
  data: UpdateBarberInput | FormData
): Promise<Barber> {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(API_ENDPOINTS.BARBERS.BY_ID(id), {
    method: "PATCH",
    headers,
    credentials: "include",
    body: isFormData ? data : JSON.stringify(data),
  });

  const resJson = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      resJson.message || `Failed to update barber (HTTP ${response.status})`
    );
  }

  return resJson.data;
}

/**
 * Updates the active status of a barber (Admin Only).
 * PATCH /api/barbers/:id/status
 */
export async function updateBarberStatus(
  id: string,
  isActive: boolean
): Promise<Barber> {
  const response = await fetch(API_ENDPOINTS.BARBERS.STATUS(id), {
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
      resJson.message || `Failed to update barber status (HTTP ${response.status})`
    );
  }

  return resJson.data;
}

/**
 * Deletes a barber permanently (Admin Only).
 * DELETE /api/barbers/:id
 */
export async function deleteBarber(id: string): Promise<{ id: string }> {
  const response = await fetch(API_ENDPOINTS.BARBERS.BY_ID(id), {
    method: "DELETE",
    credentials: "include",
  });

  const resJson = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      resJson.message || `Failed to delete barber (HTTP ${response.status})`
    );
  }

  return resJson.data || { id };
}

/**
 * Uploads a barber profile image file to ImgBB via the backend upload endpoint (Admin Only).
 * POST /api/uploads/service-image
 */
export async function uploadBarberImage(file: File): Promise<ImageUploadData> {
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type.toLowerCase())) {
    throw new Error("Invalid file type. Only JPEG, JPG, PNG, and WebP images are allowed.");
  }

  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error("Image file exceeds the 5 MB maximum size limit.");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(API_ENDPOINTS.UPLOADS.SERVICE_IMAGE, {
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
