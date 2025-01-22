import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { db } from "~/server/db";
import { tokens } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const tokensRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return await db.select().from(tokens);
  }),

  addToken: protectedProcedure
    .input(z.object({
      name: z.string(),
      address: z.string(),
      abi: z.string(),
    }))
    .mutation(async ({ input }) => {
      const result = await db.insert(tokens).values({
        name: input.name,
        address: input.address,
        abi: input.abi,
      }).returning();
      return result[0];
    }),

  deleteToken: protectedProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      await db.delete(tokens).where(eq(tokens.id, input));
      return { success: true };
    }),
});