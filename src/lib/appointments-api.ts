import { API_ENDPOINTS } from "./api-config";
import type {
  Appointment,
  CreateAppointmentInput,
  AppointmentsResponse,
  SingleAppointmentResponse,
} from "@/types";

export interface GetMyAppointmentsParams {
  page?: number;
  limit?: number;
  status?: "pending" | "confirmed" | "cancelled" | "all";
}

/**
 * Creates a new appointment for the authenticated customer.
 * POST /api/appointments
 *
 * Payload:
 * {
 *   serviceId: string,
 *   appointmentDate: "YYYY-MM-DD",
 *   timeSlot: "HH:mm",
 *   message?: string
 * }
 */
export async function createAppointment(
  input: CreateAppointmentInput
): Promise<Appointment> {
  const response = await fetch(API_ENDPOINTS.APPOINTMENTS.BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const resJson = await response.json().catch(() => ({}));

  if (response.status === 409) {
    throw new Error(
      resJson.message ||
        "This time slot is already booked for the selected date. Please choose another time slot."
    );
  }

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (response.status === 403) {
    throw new Error(
      resJson.message ||
        "Access denied. Only authenticated customers can schedule appointments."
    );
  }

  if (!response.ok) {
    throw new Error(
      resJson.message || `Failed to book appointment (HTTP ${response.status})`
    );
  }

  return resJson.data;
}

/**
 * Retrieves paginated appointments for the authenticated customer.
 * GET /api/appointments/my
 */
export async function getMyAppointments(
  params: GetMyAppointmentsParams = {}
): Promise<AppointmentsResponse> {
  const url = new URL(API_ENDPOINTS.APPOINTMENTS.MY);

  if (params.page && params.page > 1) {
    url.searchParams.set("page", params.page.toString());
  }
  if (params.limit) {
    url.searchParams.set("limit", params.limit.toString());
  }
  if (params.status && params.status !== "all") {
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

  const resJson = await response.json().catch(() => ({}));

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (response.status === 403) {
    throw new Error(
      resJson.message ||
        "Access denied. Customer appointments are available only to customer accounts."
    );
  }

  if (!response.ok) {
    throw new Error(
      resJson.message || `Failed to fetch appointments (HTTP ${response.status})`
    );
  }

  return resJson;
}

/**
 * Retrieves a single appointment belonging to the authenticated customer.
 * GET /api/appointments/my/:id
 */
export async function getMyAppointmentById(id: string): Promise<Appointment> {
  const response = await fetch(API_ENDPOINTS.APPOINTMENTS.MY_BY_ID(id), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
  });

  const resJson: SingleAppointmentResponse = await response.json().catch(() => ({}));

  if (response.status === 404) {
    throw new Error("NOT_FOUND");
  }

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (response.status === 403) {
    throw new Error(
      resJson.message || "Forbidden: You are not authorized to view this appointment"
    );
  }

  if (!response.ok || !resJson.data) {
    throw new Error(
      resJson.message || `Failed to fetch appointment details (HTTP ${response.status})`
    );
  }

  return resJson.data;
}

/**
 * Cancels a pending appointment belonging to the authenticated customer.
 * PATCH /api/appointments/my/:id/cancel
 */
export async function cancelMyAppointment(id: string): Promise<Appointment> {
  const response = await fetch(API_ENDPOINTS.APPOINTMENTS.CANCEL_MY(id), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const resJson = await response.json().catch(() => ({}));

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (response.status === 403) {
    throw new Error(
      resJson.message || "Forbidden: You are not authorized to cancel this appointment"
    );
  }

  if (!response.ok) {
    throw new Error(
      resJson.message || `Failed to cancel appointment (HTTP ${response.status})`
    );
  }

  return resJson.data;
}
