"use client";
import { useState, useEffect } from "react";
import {
  ThirdwebProvider,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
  rainbowWallet,
  trustWallet
} from "@thirdweb-dev/react";
import { Ethereum, Polygon, Goerli, Mumbai } from "@thirdweb-dev/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const supportedWallets = [
  metamaskWallet({ recommended: true }),
  coinbaseWallet({ recommended: true }),
  walletConnect(),
  rainbowWallet(),
  trustWallet()
];

const supportedChains = [Ethereum, Polygon, Goerli, Mumbai];
const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

const client = new QueryClient();

export default function Web3Provider({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <ThirdwebProvider
      supportedChains={supportedChains}
      supportedWallets={supportedWallets}
      autoConnect={true}
      clientId={clientId}
      dAppMeta={{
        name: "Push Communities",
        description:
          "Push Communities is a decentralized chat application that allows users to create and join chat groups. It is built on top of the Push Protocol.",
        logoUrl: "https://example.com/logo.png",
        url: "https://example.com"
      }}
    >
      <QueryClientProvider client={client}>
        {mounted && children}
      </QueryClientProvider>
    </ThirdwebProvider>
  );
}
