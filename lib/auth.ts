import { betterAuth } from 'better-auth';

import { ENV } from '@/config/envs/env';

export const auth = betterAuth({
    secret          : ENV.BETTER_AUTH.SECRET,
    baseURL         : ENV.BETTER_AUTH.URL,
    trustedOrigins  : [ ENV.BETTER_AUTH.URL ],
    socialProviders : {
        microsoft: {
            clientId      : ENV.MICROSOFT.CLIENT_ID,
            clientSecret  : ENV.MICROSOFT.CLIENT_SECRET,
            tenantId      : ENV.MICROSOFT.TENANT_ID,
        },
    },
});
