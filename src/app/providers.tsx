"use client";

import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia, goerli } from 'wagmi/chains';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';
import { AuthProvider } from './_components/AuthContext';
import { TRPCProvider } from '~/trpc/Provider';

const config = createConfig({
    chains: [mainnet, sepolia, goerli],
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
        [goerli.id]: http()
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