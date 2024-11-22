import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

//Database ile bağlanacak!!!!!
const tokensDb = new Map<string, { abi: string; address: string }>();

export const tokensRouter = createTRPCRouter({
  // Fetch all tokens
  getAll: publicProcedure.query(() => {
    return Array.from(tokensDb.entries()).map(([key, value]) => ({
      name: key,
      ...value,
    }));
  }),

  // Add a new token
  addToken: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        address: z.string(),
        abi: z.string(),
      })
    )
    .mutation(({ input }) => {
      if (tokensDb.has(input.name)) {
        throw new Error("Token already exists.");
      }
      tokensDb.set(input.name, { address: input.address, abi: input.abi });
      return { success: true, message: "Token added successfully!" };
    }),

  // Fetch a specific token
  getToken: publicProcedure
    .input(z.string()) // Token name
    .query(({ input }) => {
      const token = tokensDb.get(input);
      if (!token) {
        throw new Error("Token not found.");
      }
      return token;
    }),
});
