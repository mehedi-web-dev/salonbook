import { API_ENDPOINTS } from "./api-config";
import type {
  AdminDashboardStats,
  AdminDashboardStatsResponse,
  AdminUser,
  AdminUsersResponse,
  SingleAdminUserResponse,
  AdminTransaction,
  AdminTransactionsResponse,
  SingleAdminTransactionResponse,
  TransactionStatus,
  Appointment,
  AppointmentsResponse,
} from "@/types";

export interface GetAdminUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "active" | "blocked";
  role?: string;
}

export interface GetAdminTransactionsParams {
  page?: number;
  limit?: number;
  status?: "all" | TransactionStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  customerId?: string;
}

export interface GetAdminAppointmentsParams {
  page?: number;
  limit?: number;
  status?: "all" | "pending" | "confirmed" | "cancelled";
  paymentStatus?: "all" | "unpaid" | "paid";
  appointmentDate?: string;
  customerId?: string;
}

/**
 * Retrieves live aggregated statistics for the Admin Dashboard.
 * GET /api/admin/dashboard/stats
 */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const response = await fetch(API_ENDPOINTS.ADMIN.STATS, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
  });

  const resJson: AdminDashboardStatsResponse = await response.json().catch(() => ({
    success: false,
    data: {
      customers: { total: 0, active: 0, blocked: 0 },
      services: { total: 0, active: 0, inactive: 0 },
      appointments: { total: 0, pending: 0, confirmed: 0, cancelled: 0 },
      transactions: { total: 0, paid: 0, failed: 0, reconciliationRequired: 0 },
      revenue: { byCurrency: [], summary: {} },
    },
  }));

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (response.status === 403) {
    throw new Error("FORBIDDEN: Administrative access required");
  }

  if (!response.ok || !resJson.success || !resJson.data) {
    throw new Error(`Failed to load administrative statistics (HTTP ${response.status})`);
  }

  return resJson.data;
}

/**
 * Lists registered customers with pagination, search, and status filtering.
 * GET /api/admin/users
 */
export async function getAdminUsers(
  params: GetAdminUsersParams = {}
): Promise<AdminUsersResponse> {
  const url = new URL(API_ENDPOINTS.ADMIN.USERS);

  if (params.page && params.page > 1) {
    url.searchParams.set("page", params.page.toString());
  }
  if (params.limit) {
    url.searchParams.set("limit", params.limit.toString());
  }
  if (params.search && params.search.trim()) {
    url.searchParams.set("search", params.search.trim());
  }
  if (params.status && params.status !== "all") {
    url.searchParams.set("status", params.status);
  }
  if (params.role) {
    url.searchParams.set("role", params.role);
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
    throw new Error(resJson.message || "FORBIDDEN: Administrative access required");
  }

  if (!response.ok) {
    throw new Error(resJson.message || `Failed to fetch customers (HTTP ${response.status})`);
  }

  return resJson;
}

/**
 * Retrieves full customer details by ID (excluding password hashes and tokens).
 * GET /api/admin/users/:id
 */
export async function getAdminUserById(id: string): Promise<AdminUser> {
  const response = await fetch(API_ENDPOINTS.ADMIN.USER_BY_ID(id), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
  });

  const resJson: SingleAdminUserResponse = await response.json().catch(() => ({}));

  if (response.status === 404) {
    throw new Error("USER_NOT_FOUND");
  }

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (response.status === 403) {
    throw new Error(resJson.message || "FORBIDDEN: Administrative access required");
  }

  if (!response.ok || !resJson.data) {
    throw new Error(resJson.message || `Failed to load customer details (HTTP ${response.status})`);
  }

  return resJson.data;
}

/**
 * Blocks or unblocks a customer account.
 * PATCH /api/admin/users/:id/status
 * Note: Role cannot be modified; self-blocking is prohibited.
 */
export async function updateAdminUserStatus(
  id: string,
  isBlocked: boolean
): Promise<AdminUser> {
  const response = await fetch(API_ENDPOINTS.ADMIN.USER_STATUS(id), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ isBlocked }),
  });

  const resJson: SingleAdminUserResponse = await response.json().catch(() => ({}));

  if (response.status === 400) {
    throw new Error(resJson.message || "Invalid status modification request");
  }

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (response.status === 403) {
    throw new Error(resJson.message || "FORBIDDEN: Cannot modify administrator account status");
  }

  if (response.status === 404) {
    throw new Error("USER_NOT_FOUND");
  }

  if (!response.ok || !resJson.data) {
    throw new Error(resJson.message || `Failed to update user status (HTTP ${response.status})`);
  }

  return resJson.data;
}

/**
 * Lists all transactions across customers with pagination, status, date, and search filtering.
 * GET /api/admin/transactions
 * Note: Transactions are strictly read-only.
 */
export async function getAdminTransactions(
  params: GetAdminTransactionsParams = {}
): Promise<AdminTransactionsResponse> {
  const url = new URL(API_ENDPOINTS.ADMIN.TRANSACTIONS);

  if (params.page && params.page > 1) {
    url.searchParams.set("page", params.page.toString());
  }
  if (params.limit) {
    url.searchParams.set("limit", params.limit.toString());
  }
  if (params.status && params.status !== "all") {
    url.searchParams.set("status", params.status);
  }
  if (params.startDate) {
    url.searchParams.set("startDate", params.startDate);
  }
  if (params.endDate) {
    url.searchParams.set("endDate", params.endDate);
  }
  if (params.search && params.search.trim()) {
    url.searchParams.set("search", params.search.trim());
  }
  if (params.customerId) {
    url.searchParams.set("customerId", params.customerId);
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
    throw new Error(resJson.message || "FORBIDDEN: Administrative access required");
  }

  if (!response.ok) {
    throw new Error(resJson.message || `Failed to fetch transactions (HTTP ${response.status})`);
  }

  return resJson;
}

/**
 * Retrieves full details for a single transaction.
 * GET /api/admin/transactions/:id
 * Note: No mutation API exists.
 */
export async function getAdminTransactionById(id: string): Promise<AdminTransaction> {
  const response = await fetch(API_ENDPOINTS.ADMIN.TRANSACTION_BY_ID(id), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
  });

  const resJson: SingleAdminTransactionResponse = await response.json().catch(() => ({}));

  if (response.status === 404) {
    throw new Error("TRANSACTION_NOT_FOUND");
  }

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (response.status === 403) {
    throw new Error(resJson.message || "FORBIDDEN: Administrative access required");
  }

  if (!response.ok || !resJson.data) {
    throw new Error(resJson.message || `Failed to load transaction details (HTTP ${response.status})`);
  }

  return resJson.data;
}

/**
 * Retrieves all appointments across the salon for administrative review.
 * GET /api/appointments
 */
export async function getAdminAppointments(
  params: GetAdminAppointmentsParams = {}
): Promise<AppointmentsResponse> {
  const url = new URL(API_ENDPOINTS.ADMIN.APPOINTMENTS);

  if (params.page && params.page > 1) {
    url.searchParams.set("page", params.page.toString());
  }
  if (params.limit) {
    url.searchParams.set("limit", params.limit.toString());
  }
  if (params.status && params.status !== "all") {
    url.searchParams.set("status", params.status);
  }
  if (params.paymentStatus && params.paymentStatus !== "all") {
    url.searchParams.set("paymentStatus", params.paymentStatus);
  }
  if (params.appointmentDate) {
    url.searchParams.set("appointmentDate", params.appointmentDate);
  }
  if (params.customerId) {
    url.searchParams.set("customerId", params.customerId);
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
    throw new Error(resJson.message || "FORBIDDEN: Administrative access required");
  }

  if (!response.ok) {
    throw new Error(resJson.message || `Failed to fetch appointments (HTTP ${response.status})`);
  }

  return resJson;
}

/**
 * Updates an appointment's status (e.g. pending -> confirmed / cancelled).
 * PATCH /api/appointments/:id/status
 */
export async function updateAdminAppointmentStatus(
  id: string,
  status: "pending" | "confirmed" | "cancelled"
): Promise<Appointment> {
  const response = await fetch(API_ENDPOINTS.ADMIN.APPOINTMENT_STATUS(id), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ status }),
  });

  const resJson = await response.json().catch(() => ({}));

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (response.status === 403) {
    throw new Error(resJson.message || "FORBIDDEN: Administrative access required");
  }

  if (!response.ok || !resJson.data) {
    throw new Error(resJson.message || `Failed to update appointment status (HTTP ${response.status})`);
  }

  return resJson.data;
}
