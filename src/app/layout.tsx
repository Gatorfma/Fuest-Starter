"use client";

import "~/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { TRPCReactProvider } from "~/trpc/react";

const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http()
  }
});

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}