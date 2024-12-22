import { createTRPCRouter } from "~/server/api/trpc";
import { eligibilityRouter } from "./routers/eligibility";
import { tokensRouter } from "./routers/tokens";

export const appRouter = createTRPCRouter({
  eligibility: eligibilityRouter,
  tokens: tokensRouter,
});

export type AppRouter = typeof appRouter;