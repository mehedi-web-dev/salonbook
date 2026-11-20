import { API_ENDPOINTS } from "./api-config";
import type {
  PaymentTransaction,
  PaymentsResponse,
  SinglePaymentResponse,
  CreateCheckoutSessionResponse,
} from "@/types";

export interface GetMyPaymentsParams {
  page?: number;
  limit?: number;
}

/**
 * Creates a Stripe Checkout Session for a confirmed, unpaid appointment.
 * POST /api/payments/create-checkout-session
 *
 * Requirements:
 * - Only authenticated customers
 * - appointmentId required
 * - Never send payment amounts from frontend
 * - Includes Better Auth credentials
 */
export async function createCheckoutSession(
  appointmentId: string
): Promise<{ sessionId: string; url: string }> {
  const response = await fetch(API_ENDPOINTS.PAYMENTS.CREATE_CHECKOUT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ appointmentId }),
  });

  const resJson: CreateCheckoutSessionResponse = await response
    .json()
    .catch(() => ({ success: false, message: "Invalid server response", data: { sessionId: "", url: "" } }));

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (response.status === 403) {
    throw new Error(
      resJson.message || "Access denied. Only customers can make appointment payments."
    );
  }

  if (!response.ok || !resJson.success || !resJson.data?.url) {
    throw new Error(
      resJson.message || `Failed to initiate Stripe Checkout (HTTP ${response.status})`
    );
  }

  return resJson.data;
}

/**
 * Retrieves paginated payment history for the authenticated customer.
 * GET /api/payments/my
 */
export async function getMyPayments(
  params: GetMyPaymentsParams = {}
): Promise<PaymentsResponse> {
  const url = new URL(API_ENDPOINTS.PAYMENTS.MY);

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

  const resJson = await response.json().catch(() => ({}));

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (response.status === 403) {
    throw new Error(
      resJson.message || "Access denied. Payment history is reserved for customer accounts."
    );
  }

  if (!response.ok) {
    throw new Error(
      resJson.message || `Failed to fetch payment history (HTTP ${response.status})`
    );
  }

  return resJson;
}

/**
 * Retrieves a single payment record for the authenticated customer.
 * GET /api/payments/my/:id
 */
export async function getMyPaymentById(id: string): Promise<PaymentTransaction> {
  const response = await fetch(API_ENDPOINTS.PAYMENTS.MY_BY_ID(id), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
  });

  const resJson: SinglePaymentResponse = await response.json().catch(() => ({}));

  if (response.status === 404) {
    throw new Error("NOT_FOUND");
  }

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (response.status === 403) {
    throw new Error(
      resJson.message || "Forbidden: You are not authorized to view this payment record"
    );
  }

  if (!response.ok || !resJson.data) {
    throw new Error(
      resJson.message || `Failed to fetch payment details (HTTP ${response.status})`
    );
  }

  return resJson.data;
}
