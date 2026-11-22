/**
 * Centralized API configuration for SalonBook frontend.
 * 
 * Same-Origin Authentication & API Proxy Architecture:
 * - Production Frontend: https://salonbook-virid.vercel.app
 * - Production Backend:  https://salonbook-server-roan.vercel.app
 * - Local Development:   http://localhost:5000 (proxied via Next.js or direct)
 * 
 * Architecture Rules:
 * 1. In production, browser requests for Better Auth (/api/auth/*) and REST APIs (/api/*)
 *    route to the SAME-ORIGIN frontend (https://salonbook-virid.vercel.app).
 * 2. Next.js rewrites proxy these requests to the authoritative backend (https://salonbook-server-roan.vercel.app).
 * 3. This guarantees all session cookies (better-auth.session_token, state, etc.) are 100%
 *    FIRST-PARTY cookies on salonbook-virid.vercel.app, eliminating OAuth state_mismatch
 *    and third-party cookie restrictions.
 * 4. In local development, requests route to local backend (http://localhost:5000).
 */

export const PRODUCTION_FRONTEND_URL = "https://salonbook-virid.vercel.app";
export const PRODUCTION_BACKEND_URL = "https://salonbook-server-roan.vercel.app";
export const LOCAL_DEV_URL = "http://localhost:5000";

// Backward-compatible exports
export const PRODUCTION_API_URL = PRODUCTION_FRONTEND_URL;
export const LOCAL_API_URL = LOCAL_DEV_URL;

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
 * Resolves the base URL for frontend API calls.
 * 
 * - In production:
 *   - Browser runtime uses same-origin window.location.origin (https://salonbook-virid.vercel.app)
 *   - SSR / build-time falls back to PRODUCTION_FRONTEND_URL (https://salonbook-virid.vercel.app)
 *   - Next.js rewrites proxy /api/auth/* and /api/* to PRODUCTION_BACKEND_URL
 * - In development:
 *   - Uses local backend at http://localhost:5000
 */
export function resolveApiBaseUrl(): string {
  const isProd = isProductionEnvironment();

  if (isProd) {
    // 1. Browser runtime in production: always same-origin
    if (typeof window !== "undefined" && window.location?.origin) {
      const origin = window.location.origin;
      if (!isLocalhostUrl(origin)) {
        return sanitizeApiUrl(origin);
      }
    }

    // 2. Explicit app URL if defined
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl && appUrl.trim() && !isLocalhostUrl(appUrl)) {
      return sanitizeApiUrl(appUrl);
    }

    // 3. Fallback canonical production frontend origin
    return PRODUCTION_FRONTEND_URL;
  }

  // Local development
  const rawEnv =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_SERVER_BASE_URL;

  if (rawEnv && rawEnv.trim()) {
    return sanitizeApiUrl(rawEnv);
  }

  return LOCAL_DEV_URL;
}

/**
 * Resolves the baseURL for Better Auth client in the same-origin proxy architecture.
 * - In production browser: resolves to window.location.origin (same-origin, e.g. https://salonbook-virid.vercel.app)
 * - In production SSR: resolves to canonical frontend origin (https://salonbook-virid.vercel.app)
 * - In local development: resolves to local API_BASE_URL (http://localhost:5000 or http://localhost:3000)
 * 
 * Never targets the production backend directly (https://salonbook-server-roan.vercel.app),
 * ensuring all authentication requests traverse the Next.js reverse-proxy rewrite at /api/auth/*.
 */
export function getAuthClientBaseUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    const origin = window.location.origin;
    if (!isLocalhostUrl(origin)) {
      return sanitizeApiUrl(origin);
    }
  }
  return isProductionEnvironment() ? PRODUCTION_FRONTEND_URL : LOCAL_DEV_URL;
}

/**
 * Global API base URL used across all API client utilities.
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
