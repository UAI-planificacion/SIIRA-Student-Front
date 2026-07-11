import { z } from 'zod';

/**
 * Environment variables schema using Zod for validation.
 * Covers both client-side MSAL variables and server-side Better-Auth variables.
 */
const envSchema = z.object({
    // MSAL Authentication (client-side, kept for compatibility)
    NEXT_PUBLIC_MSAL_CLIENT_ID     : z.string().min( 1, { message: 'MSAL Client ID is required' }),
    NEXT_PUBLIC_MSAL_CLIENT_SECRET : z.string().min( 1, { message: 'MSAL Client Secret is required' }),
    NEXT_PUBLIC_MSAL_TENANT_ID     : z.string().min( 1, { message: 'MSAL Tenant ID is required' }),

    // Microsoft OAuth — server-side (Better-Auth)
    MICROSOFT_CLIENT_ID     : z.string().min( 1, { message: 'Microsoft Client ID is required' }),
    MICROSOFT_CLIENT_SECRET : z.string().min( 1, { message: 'Microsoft Client Secret is required' }),
    MICROSOFT_TENANT_ID     : z.string().min( 1, { message: 'Microsoft Tenant ID is required' }),

    // Better-Auth
    BETTER_AUTH_SECRET : z.string().min( 1, { message: 'Better-Auth secret is required' }),
    BETTER_AUTH_URL    : z.string().url( { message: 'Better-Auth URL must be a valid URL' }),
});

/**
 * Parse and validate environment variables
 */
const processEnv = {
    NEXT_PUBLIC_MSAL_CLIENT_ID      : process.env.NEXT_PUBLIC_MSAL_CLIENT_ID,
    NEXT_PUBLIC_MSAL_CLIENT_SECRET  : process.env.NEXT_PUBLIC_MSAL_CLIENT_SECRET,
    NEXT_PUBLIC_MSAL_TENANT_ID      : process.env.NEXT_PUBLIC_MSAL_TENANT_ID,
    MICROSOFT_CLIENT_ID             : process.env.MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET         : process.env.MICROSOFT_CLIENT_SECRET,
    MICROSOFT_TENANT_ID             : process.env.MICROSOFT_TENANT_ID,
    BETTER_AUTH_SECRET              : process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL                 : process.env.BETTER_AUTH_URL,
};

/**
 * Validate environment variables against schema
 */
const parsedEnv = envSchema.safeParse( processEnv );

if ( !parsedEnv.success ) {
    console.error(
        '❌ Invalid environment variables:',
        JSON.stringify( parsedEnv.error.format(), null, 4 )
    );

    throw new Error( 'Invalid environment variables' );
}

/**
 * Export validated environment variables
 */
export const ENV = {
    MSAL: {
        CLIENT_ID       : parsedEnv.data.NEXT_PUBLIC_MSAL_CLIENT_ID,
        CLIENT_SECRET   : parsedEnv.data.NEXT_PUBLIC_MSAL_CLIENT_SECRET,
        TENANT_ID       : parsedEnv.data.NEXT_PUBLIC_MSAL_TENANT_ID,
    },
    MICROSOFT: {
        CLIENT_ID       : parsedEnv.data.MICROSOFT_CLIENT_ID,
        CLIENT_SECRET   : parsedEnv.data.MICROSOFT_CLIENT_SECRET,
        TENANT_ID       : parsedEnv.data.MICROSOFT_TENANT_ID,
    },
    BETTER_AUTH: {
        SECRET  : parsedEnv.data.BETTER_AUTH_SECRET,
        URL     : parsedEnv.data.BETTER_AUTH_URL,
    },
};
