"use client";

import { type ReactNode } from "react";
import { base, baseSepolia } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { coinbaseWallet, walletConnect } from "wagmi/connectors";
import { createStorage, cookieStorage } from "wagmi";

// Create QueryClient for React Query
const queryClient = new QueryClient();

// Configure Wagmi with DUAL NETWORK support:
// - Base Mainnet for OnchainKit Swap component (REQUIRED)
// - Base Sepolia for Sub Accounts & Spend Permissions (REQUIRED)
const wagmiConfig = createConfig({
  chains: [base, baseSepolia], // DUAL NETWORK: mainnet + sepolia
  connectors: [
    coinbaseWallet({
      appName: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "HowToBase Academy",
      preference: "smartWalletOnly", // Force Smart Wallet for Sub Accounts & Spend Permissions
      version: "4",
      // @ts-expect-error - Required for Sub Accounts on testnet
      keysUrl: "https://keys-dev.coinbase.com/connect", // Sub Accounts dev environment
    }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
      metadata: {
        name: "HowToBase Academy",
        description: "Learn Base builder tools through interactive tutorials",
        url: "https://howtobase.academy",
        icons: ["/icon.png"],
      },
    }),
  ],
  storage: createStorage({
    storage: cookieStorage, // Required for SSR
  }),
  transports: {
    [base.id]: http(), // Mainnet for Swap
    [baseSepolia.id]: http(), // Sepolia for Sub Accounts
  },
  ssr: true,
});

export function Providers(props: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {/* OnchainKitProvider - Always use Base Mainnet for Swap compatibility */}
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base} // FORCE Base Mainnet for OnchainKit (Swap requirement)
          config={{
            appearance: {
              mode: "auto",
              theme: "base",
              name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
              logo: process.env.NEXT_PUBLIC_ICON_URL,
            },
            paymaster: process.env.NEXT_PUBLIC_PAYMASTER_URL, // Paymaster for sponsored transactions on Sepolia
            wallet: {
              display: "modal",
            },
          }}
        >
          {/* MiniKitProvider - Use Base Sepolia for Sub Accounts */}
          <MiniKitProvider
            apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
            chain={baseSepolia} // Sepolia for Sub Accounts and Spend Permissions
          >
            {props.children}
          </MiniKitProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
