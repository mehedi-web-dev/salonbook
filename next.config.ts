import type { NextConfig } from "next";

/**
 * Resolves the destination backend server URL for Next.js rewrites.
 * - In production: defaults to the authoritative backend: https://salonbook-server-roan.vercel.app
 * - In development: defaults to the local backend: http://localhost:5000
 * - Overridable via BACKEND_INTERNAL_URL or BACKEND_URL environment variables.
 */
export function getBackendTargetUrl(): string {
  const isProd =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    process.env.VERCEL_ENV === "production";

  const explicitInternal =
    process.env.BACKEND_INTERNAL_URL ||
    process.env.BACKEND_URL;

  if (explicitInternal && explicitInternal.trim()) {
    return explicitInternal.trim().replace(/\/+$/, "");
  }

  if (isProd) {
    const candidate = process.env.NEXT_PUBLIC_SERVER_BASE_URL;
    if (
      candidate &&
      candidate.trim() &&
      !candidate.includes("localhost") &&
      !candidate.includes("127.0.0.1")
    ) {
      return candidate.trim().replace(/\/+$/, "");
    }
    return "https://salonbook-server-roan.vercel.app";
  }

  return (
    process.env.NEXT_PUBLIC_SERVER_BASE_URL?.trim() ||
    "http://localhost:5000"
  );
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  /**
   * Same-origin proxy rewrites:
   * 1. /api/auth/:path* -> Better Auth endpoints proxied to backend server.
   *    Preserves first-party cookies (state, session_token) on frontend domain.
   * 2. /api/:path* -> REST API endpoints proxied to backend server.
   *    Enables first-party session cookie delivery without third-party cookie restrictions.
   */
  async rewrites() {
    const backendTarget = getBackendTargetUrl();

    return [
      {
        source: "/api/auth/:path*",
        destination: `${backendTarget}/api/auth/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${backendTarget}/api/:path*`,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
