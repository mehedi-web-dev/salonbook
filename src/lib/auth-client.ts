import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { getAuthClientBaseUrl } from "./api-config";

export { getAuthClientBaseUrl };

/**
 * Better Auth client configuration for SalonBook frontend.
 * Bound to same-origin /api/auth proxy in production.
 * First-party credentials: "include" preserved for session cookies.
 */
export const authClient = createAuthClient({
  baseURL: getAuthClientBaseUrl(),
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
