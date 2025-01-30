"use client";

import "~/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { TRPCReactProvider } from "~/trpc/react";
import { AuthProvider } from './_components/AuthContext';

const config = createConfig({
  chains: [mainnet, sepolia],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http('https://mainnet.example.com'),
    [sepolia.id]: http('https://sepolia.example.com'),
  },
})

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <TRPCReactProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </TRPCReactProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}