/**
 * Centralized API configuration for SalonBook frontend.
 * Reads NEXT_PUBLIC_API_URL from environment variables,
 * falling back to localhost:5000 in development.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export const API_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/api/health`,
  SERVICES: `${API_BASE_URL}/api/services`,
  SERVICE_BY_ID: (id: string) => `${API_BASE_URL}/api/services/${id}`,
  BOOKINGS: `${API_BASE_URL}/api/bookings`,
  BOOKING_BY_ID: (id: string) => `${API_BASE_URL}/api/bookings/${id}`,
  USER_BOOKINGS: (email: string) =>
    `${API_BASE_URL}/api/bookings?email=${encodeURIComponent(email)}`,
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    ME: `${API_BASE_URL}/api/auth/me`,
  },
  UPLOADS: {
    SERVICE_IMAGE: `${API_BASE_URL}/api/uploads/service-image`,
    PROFILE_IMAGE: `${API_BASE_URL}/api/uploads/profile-image`,
  },
  PROFILE: {
    ME: `${API_BASE_URL}/api/profile/me`,
  },
  APPOINTMENTS: {
    BASE: `${API_BASE_URL}/api/appointments`,
    MY: `${API_BASE_URL}/api/appointments/my`,
    MY_BY_ID: (id: string) => `${API_BASE_URL}/api/appointments/my/${id}`,
    CANCEL_MY: (id: string) => `${API_BASE_URL}/api/appointments/my/${id}/cancel`,
  },
  PAYMENTS: {
    CREATE_CHECKOUT: `${API_BASE_URL}/api/payments/create-checkout-session`,
    MY: `${API_BASE_URL}/api/payments/my`,
    MY_BY_ID: (id: string) => `${API_BASE_URL}/api/payments/my/${id}`,
  },
  ADMIN: {
    STATS: `${API_BASE_URL}/api/admin/dashboard/stats`,
    USERS: `${API_BASE_URL}/api/admin/users`,
    USER_BY_ID: (id: string) => `${API_BASE_URL}/api/admin/users/${id}`,
    USER_STATUS: (id: string) => `${API_BASE_URL}/api/admin/users/${id}/status`,
    TRANSACTIONS: `${API_BASE_URL}/api/admin/transactions`,
    TRANSACTION_BY_ID: (id: string) => `${API_BASE_URL}/api/admin/transactions/${id}`,
    APPOINTMENTS: `${API_BASE_URL}/api/appointments`,
    APPOINTMENT_BY_ID: (id: string) => `${API_BASE_URL}/api/appointments/${id}`,
    APPOINTMENT_STATUS: (id: string) => `${API_BASE_URL}/api/appointments/${id}/status`,
  },
} as const;
