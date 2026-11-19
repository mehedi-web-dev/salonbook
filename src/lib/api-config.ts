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
} as const;
