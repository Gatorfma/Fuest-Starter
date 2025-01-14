"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    signedInAddress: string | null;
    setAuthState: (address: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [signedInAddress, setSignedInAddress] = useState<string | null>(null);

    useEffect(() => {
        // Initial check for authentication
        const stored = localStorage.getItem('siwe_address');
        if (stored) {
            setSignedInAddress(stored);
        }

        // Add event listener for storage changes
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'siwe_address') {
                setSignedInAddress(event.newValue);
            }
        };

        // Add custom event listener for immediate updates
        const handleAuthChange = (event: CustomEvent) => {
            setSignedInAddress(event.detail.address);
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('authStateChange', handleAuthChange as EventListener);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('authStateChange', handleAuthChange as EventListener);
        };
    }, []);

    const setAuthState = (address: string | null) => {
        setSignedInAddress(address);
        if (address) {
            localStorage.setItem('siwe_address', address);
        } else {
            localStorage.removeItem('siwe_address');
        }

        // Dispatch custom event for immediate updates
        const event = new CustomEvent('authStateChange', {
            detail: { address }
        });
        window.dispatchEvent(event);
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: !!signedInAddress,
                signedInAddress,
                setAuthState,
            }}
        >
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