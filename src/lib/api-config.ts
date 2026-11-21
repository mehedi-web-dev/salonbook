/**
 * Centralized API configuration for SalonBook frontend.
 * 
 * Production Backend: https://salonbook-server-roan.vercel.app
 * Local Development:  http://localhost:5000
 * 
 * Rules:
 * 1. Production builds and deployed runtimes must NEVER fall back to localhost.
 * 2. Explicit environment variables (NEXT_PUBLIC_SERVER_BASE_URL / NEXT_PUBLIC_API_URL)
 *    are prioritized, with safeguards preventing accidental localhost usage in production.
 * 3. Local development defaults to http://localhost:5000.
 */

export const PRODUCTION_API_URL = "https://salonbook-server-roan.vercel.app";
export const LOCAL_API_URL = "http://localhost:5000";

/**
 * Detects whether the current execution context is in production.
 * Evaluates both server-side/build environment variables and client-side browser runtime.
 */
export function isProductionEnvironment(): boolean {
  // 1. Server-side / Build-time environment flags
  if (process.env.NODE_ENV === "production") {
    return true;
  }
  if (process.env.VERCEL_ENV === "production" || process.env.VERCEL === "1") {
    return true;
  }

  // 2. Client-side browser runtime checks
  if (typeof window !== "undefined" && window.location) {
    const hostname = window.location.hostname.toLowerCase();
    const isLocalhost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.endsWith(".local");
    if (!isLocalhost) {
      return true;
    }
  }

  return false;
}

/**
 * Checks whether a given URL points to a local or loopback address.
 */
export function isLocalhostUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host.endsWith(".local") ||
      host === "0.0.0.0"
    );
  } catch {
    return url.includes("localhost") || url.includes("127.0.0.1");
  }
}

/**
 * Strips trailing slashes and trims whitespace from a URL string.
 */
export function sanitizeApiUrl(url: string): string {
  if (!url) return "";
  return url.trim().replace(/\/+$/, "");
}

/**
 * Resolves the authoritative backend API base URL with production safeguards.
 * 
 * Priority:
 * 1. Explicit environment variable (NEXT_PUBLIC_SERVER_BASE_URL or NEXT_PUBLIC_API_URL).
 *    - In production: If the env var points to localhost or is invalid, safely overrides
 *      with PRODUCTION_API_URL to prevent production breakage.
 *    - In development: Respects local or custom dev URL.
 * 2. Unset environment variable:
 *    - In production: Strictly defaults to PRODUCTION_API_URL (never localhost).
 *    - In development: Defaults to LOCAL_API_URL (http://localhost:5000).
 */
export function resolveApiBaseUrl(): string {
  const isProd = isProductionEnvironment();

  // Read statically so Next.js build-time inlining works as expected
  const rawEnv =
    process.env.NEXT_PUBLIC_SERVER_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL;

  if (rawEnv && rawEnv.trim()) {
    const sanitized = sanitizeApiUrl(rawEnv);
    if (isProd && isLocalhostUrl(sanitized)) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn(
          `[SalonBook API] Warning: Localhost API URL ("${sanitized}") detected in production environment. Safely overriding with production backend: ${PRODUCTION_API_URL}`
        );
      }
      return PRODUCTION_API_URL;
    }
    return sanitized;
  }

  return isProd ? PRODUCTION_API_URL : LOCAL_API_URL;
}

/**
 * Global API base URL used across all API client utilities and Better Auth.
 */
export const API_BASE_URL: string = resolveApiBaseUrl();

/**
 * Validates the resolved API configuration and reports runtime status.
 */
export function validateApiConfig(): {
  resolvedUrl: string;
  isProduction: boolean;
  isSafeForProduction: boolean;
} {
  const resolvedUrl = resolveApiBaseUrl();
  const isProd = isProductionEnvironment();
  const isLocal = isLocalhostUrl(resolvedUrl);

  return {
    resolvedUrl,
    isProduction: isProd,
    isSafeForProduction: !isProd || !isLocal,
  };
}

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
