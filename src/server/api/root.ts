import { createTRPCRouter } from "~/server/api/trpc";
import { eligibilityRouter } from "./routers/eligibility";
import { tokensRouter } from "./routers/tokens";
import { postsRouter } from "./routers/post";
import { authRouter } from "~/server/api/routers/sign-in";

export const appRouter = createTRPCRouter({
  eligibility: eligibilityRouter,
  tokens: tokensRouter,
  posts: postsRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
