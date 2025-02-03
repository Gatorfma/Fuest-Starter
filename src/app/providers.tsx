"use client";

import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { AuthProvider } from './_components/AuthContext';
import { TRPCProvider } from '~/trpc/Provider';

const config = createConfig({
    chains: [mainnet],
    transports: {
        [mainnet.id]: http()
    },
    multiInjectedProviderDiscovery: true
});

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <TRPCProvider>
            <WagmiProvider config={config}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </WagmiProvider>
        </TRPCProvider>
    );
}