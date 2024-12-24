import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        RPC_URL: z.string().url(),
        DATABASE_URL: z.string(),
        POSTGRES_URL: z.string(),
        NEXTAUTH_URL: z.string().url(),
        TWITTER_CLIENT_ID: z.string(),
        TWITTER_CLIENT_SECRET: z.string(),
    },
    client: {},
    runtimeEnv: {
        RPC_URL: process.env.RPC_URL,
        DATABASE_URL: process.env.DATABASE_URL || process.env.POSTGRES_URL,
        POSTGRES_URL: process.env.POSTGRES_URL,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        TWITTER_CLIENT_ID: process.env.TWITTER_CLIENT_ID,
        TWITTER_CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET,
    },
});