import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        RPC_URL: z.string().url(),
        DATABASE_URL: z.string(),
    },
    client: {},
    runtimeEnv: {
        RPC_URL: process.env.RPC_URL,
        DATABASE_URL: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    },
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});