"use client";

import { useState, useEffect } from "react";
import {
  useMiniKit,
  useAddFrame,
} from "@coinbase/onchainkit/minikit";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { HowToBaseAcademy } from "./components/Academy/HowToBaseAcademy";

export default function App() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const [showAcademy, setShowAcademy] = useState(false);

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  if (showAcademy) {
    return <HowToBaseAcademy onBack={() => setShowAcademy(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-black flex flex-col items-center justify-center text-white font-sans">
      {/* Header with wallet */}
      <div className="absolute top-4 right-4">
        <Wallet className="z-10">
          <ConnectWallet>
            <Name className="text-white" />
          </ConnectWallet>
          <WalletDropdown>
            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
              <Avatar />
              <Name />
              <Address />
              <EthBalance />
            </Identity>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </div>

      {/* Main content */}
      <div className="text-center space-y-8 px-6">
        {/* Hero Section */}
        <div className="space-y-6">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent animate-pulse">
            How To Base
          </h1>
          <p className="text-xl md:text-2xl text-blue-200 max-w-2xl mx-auto">
            Learn the Base ecosystem through interactive tutorials and hands-on experiences
          </p>
        </div>

        {/* Call to action */}
        <div className="space-y-4">
          <button
            onClick={() => setShowAcademy(true)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-4 px-8 rounded-xl text-xl shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-cyan-500/25"
          >
            🎓 Enter Academy
          </button>
          
          <p className="text-blue-300 text-sm">
            Start your journey to becoming a Base builder
          </p>
        </div>

        {/* Features preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
          <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-lg font-semibold mb-2">Smart Wallets</h3>
            <p className="text-blue-200 text-sm">Learn Sub Accounts & Spend Permissions</p>
          </div>
          
          <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-lg font-semibold mb-2">DeFi & Swaps</h3>
            <p className="text-blue-200 text-sm">Master token swapping and DeFi protocols</p>
          </div>
          
          <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-lg font-semibold mb-2">NFTs & Identity</h3>
            <p className="text-blue-200 text-sm">Mint NFTs and explore Basenames</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 text-center text-blue-300 text-sm">
        <p>Built on Base with OnchainKit & MiniKit</p>
      </div>
    </div>
  );
}
