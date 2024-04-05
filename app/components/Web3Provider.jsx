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
import { Ethereum, Polygon, Mumbai, Sepolia } from "@thirdweb-dev/chains";

const supportedWallets = [
  metamaskWallet({ recommended: true }),
  coinbaseWallet({ recommended: true }),
  walletConnect(),
  rainbowWallet(),
  trustWallet()
];

const supportedChains = [Ethereum, Polygon, Mumbai, Sepolia];
const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

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
        name: "PushTime",
        description:
          "PushTime is a decentralized video calling application built with Push Protocol",
        logoUrl: "https://example.com/logo.png",
        url: "https://example.com"
      }}
    >
      {mounted && children}
    </ThirdwebProvider>
  );
}
