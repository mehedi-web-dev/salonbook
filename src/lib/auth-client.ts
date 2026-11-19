import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { API_BASE_URL } from "./api-config";

/**
 * Better Auth client configuration for SalonBook frontend.
 * Centralizes cross-origin credentials and custom user field typing.
 */
export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
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
