import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { SiweMessage } from "siwe";
import { TRPCError } from "@trpc/server";
import { createJWT, jwtCookieOptions } from "~/server/utils/jwt";
import { cookies } from 'next/headers';

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
        .mutation(async ({ input, ctx }) => {
            try {
                const siweMessage = new SiweMessage(input.message);

                const fields = await siweMessage.verify({
                    signature: input.signature,
                    domain: process.env.NEXT_PUBLIC_DOMAIN || "localhost:3000",
                    time: new Date().toISOString(),
                });

                if (!fields.success) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Signature verification failed",
                    });
                }

                const jwt = await createJWT(fields.data.address);

                const cookieStore = cookies();
                cookieStore.set('auth-token', jwt, {
                    ...jwtCookieOptions,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                });

                console.log('Setting cookie with JWT:', {
                    tokenLength: jwt.length,
                    address: fields.data.address,
                    cookieOptions: jwtCookieOptions
                });

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
    signOut: publicProcedure
        .mutation(async () => {
            cookies().delete('auth-token');
            return { success: true };
        }),
});