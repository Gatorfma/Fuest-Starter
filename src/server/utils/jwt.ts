import { SignJWT, jwtVerify } from 'jose';
import { env } from "~/env";


const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);
const COOKIE_NAME = 'auth-token';

export async function createJWT(address: string) {
    const jwt = await new SignJWT({ address })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(JWT_SECRET);
    return jwt;
}

export async function verifyJWT(token: string) {
    try {
        const verified = await jwtVerify(token, JWT_SECRET);
        return {
            success: true,
            address: verified.payload.address as string
        };
    } catch (error) {
        return { success: false, address: null };
    }
}

export const jwtCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24,
};