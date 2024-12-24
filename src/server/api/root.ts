import { createTRPCRouter } from "~/server/api/trpc";
import { eligibilityRouter } from "./routers/eligibility";
import { tokensRouter } from "./routers/tokens";
import { postsRouter } from "./routers/post";

export const appRouter = createTRPCRouter({
  eligibility: eligibilityRouter,
  tokens: tokensRouter,
  posts: postsRouter,
});

export type AppRouter = typeof appRouter;