"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { SiweMessage } from 'siwe';

interface AuthContextType {
    isAuthenticated: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    loading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { address, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();

    useEffect(() => {
        checkAuthStatus();
    }, [address, isConnected]);

    const checkAuthStatus = async () => {
        try {
            const response = await fetch('/api/auth/verify');
            const data = await response.json();
            setIsAuthenticated(data.authenticated);
        } catch (err) {
            setError('Failed to verify authentication status');
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const signIn = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!address || !isConnected) {
                throw new Error('Wallet not connected');
            }

            // Get nonce
            const nonceRes = await fetch('/api/auth/nonce');
            const nonce = await nonceRes.text();

            // Create SIWE message
            const message = new SiweMessage({
                domain: window.location.host,
                address,
                statement: 'Sign in with Ethereum to the app.',
                uri: window.location.origin,
                version: '1',
                chainId: 1,
                nonce
            });

            // Sign message
            const signature = await signMessageAsync({
                message: message.prepareMessage()
            });

            // Verify signature
            const verifyRes = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, signature }),
            });

            if (!verifyRes.ok) throw new Error('Failed to verify signature');

            setIsAuthenticated(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sign in');
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            setLoading(true);
            await fetch('/api/auth/signout', { method: 'POST' });
            setIsAuthenticated(false);
        } catch (err) {
            setError('Failed to sign out');
        } finally {
            setLoading(false);
        }
    };

    const value = {
        isAuthenticated,
        signIn,
        signOut,
        loading,
        error
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}