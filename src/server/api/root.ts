import { createTRPCRouter } from "./trpc";
import { eligibilityRouter } from "./routers/eligibility";

export const appRouter = createTRPCRouter({
  eligibility: eligibilityRouter,
});

export type AppRouter = typeof appRouter;