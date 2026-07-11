import { createAuthClient } from 'better-auth/react';

/**
 * Better-Auth client instance.
 * Uses NEXT_PUBLIC_BETTER_AUTH_URL (client-safe) instead of importing from env.ts,
 * which validates server-only variables and would fail on the client side.
 */
export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
});
