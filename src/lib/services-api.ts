import { API_BASE_URL } from "./api-config";
import type { ServicesResponse, SingleServiceResponse, Service } from "@/types";

export interface FetchServicesParams {
  search?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
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
