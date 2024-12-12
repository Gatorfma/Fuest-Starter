import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        RPC_URL: z.string().url(),
    },
    client: {},
    runtimeEnv: {
        RPC_URL: process.env.RPC_URL,
    },
});