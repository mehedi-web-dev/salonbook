import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { API_BASE_URL } from "./api-config";

/**
 * Better Auth client configuration for SalonBook frontend.
 * Explicitly binds to the centralized API_BASE_URL (production or local dev).
 * Cross-origin credentials: "include" preserved for session cookies.
 */
export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          required: false,
          defaultValue: "customer",
        },
        isBlocked: {
          type: "boolean",
          required: false,
          defaultValue: false,
        },
        phone: {
          type: "string",
          required: false,
        },
      },
    }),
  ],
});

export const { useSession, signIn, signUp, signOut } = authClient;
