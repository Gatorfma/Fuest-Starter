/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 */
import { initTRPC, TRPCError } from "@trpc/server";
import { cookies } from "next/headers";
import superjson from "superjson";
import { z, ZodError } from "zod";

import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import { verifyJWT } from "~/server/utils/jwt";

/**
 * Storage for ABI and contract addresses.
 */
const contractStore: Record<string, { abi: any; address: string }> = {};

/**
 * 1. CONTEXT
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await getServerAuthSession();

  return {
    db,
    session,
    contractStore,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE
 */

const authMiddleware = t.middleware(async ({ ctx, next }) => {
  const cookieStore = cookies();
  const authToken = cookieStore.get("auth-token")?.value;

  if (!authToken) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const verified = await verifyJWT(authToken);
  if (!verified.success) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      ...ctx,
      user: { address: verified.address }
    }
  });
});

/**
 * Public procedure (unauthenticated).
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();
  const result = await next();
  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);
  return result;
});

export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected procedure (authenticated).
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(authMiddleware);

/**
 * Factory to create callers for any router and context.
 */
export const createCallerFactory = (router: ReturnType<typeof t.router>, ctx: any) => {
  return router.createCaller(ctx);
};

/**
 * Function to create a tRPC router.
 */
export const createTRPCRouter = t.router;
export const authenticatedProcedure = t.procedure.use(authMiddleware);