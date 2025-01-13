import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { SiweMessage, generateNonce } from "siwe";
import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
    prepareSiweMessage: publicProcedure
        .input(z.object({
            address: z.string(),
            chainId: z.number(),
            nonce: z.string(),
        }))
        .mutation(async ({ input }) => {
            try {
                const message = new SiweMessage({
                    domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:3000",
                    address: input.address,
                    statement: "Sign in with Ethereum to Fuest-Starter",
                    uri: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
                    version: "1",
                    chainId: input.chainId,
                    nonce: input.nonce,
                    issuedAt: new Date().toISOString(),
                });

                return {
                    message: message.prepareMessage(),
                };
            } catch (error) {
                console.error("Error preparing SIWE message:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to prepare SIWE message",
                    cause: error,
                });
            }
        }),

    verifySiweMessage: publicProcedure
        .input(z.object({
            message: z.string(),
            signature: z.string(),
        }))
        .mutation(async ({ input }) => {
            try {
                console.log("Verifying SIWE message:", {
                    message: input.message,
                    signatureLength: input.signature.length
                });

                const siweMessage = new SiweMessage(input.message);

                // Log the parsed message for debugging
                console.log("Parsed SIWE message:", {
                    domain: siweMessage.domain,
                    address: siweMessage.address,
                    chainId: siweMessage.chainId,
                    nonce: siweMessage.nonce,
                    issuedAt: siweMessage.issuedAt
                });

                const fields = await siweMessage.verify({
                    signature: input.signature,
                    domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:3000", // Must match the domain used in prepareSiweMessage
                    time: new Date().toISOString(),
                });

                if (!fields.success) {
                    console.error("SIWE verification failed:", fields);
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Signature verification failed",
                    });
                }

                return {
                    address: fields.data.address,
                    success: true,
                };
            } catch (error) {
                console.error("Error verifying SIWE message:", error);
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Failed to verify signature",
                    cause: error,
                });
            }
        }),
});