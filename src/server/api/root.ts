import { createTRPCRouter } from "~/server/api/trpc";
import { tokensRouter } from "./routers/tokens";

export const appRouter = createTRPCRouter({
  tokens: tokensRouter,
});

// Export API type
export type AppRouter = typeof appRouter;
