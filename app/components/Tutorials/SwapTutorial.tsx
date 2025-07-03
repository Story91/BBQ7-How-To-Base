"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { 
  Swap,
  SwapAmountInput,
  SwapToggleButton,
  SwapButton,
  SwapMessage,
  SwapToast,
} from '@coinbase/onchainkit/swap';
import { 
  TokenImage,
} from '@coinbase/onchainkit/token';
import type { Token as TokenType } from '@coinbase/onchainkit/token';
import { useNotification } from '@coinbase/onchainkit/minikit';
import { base, baseSepolia } from 'viem/chains';

interface SwapTutorialProps {
  onAchievementUnlock?: (achievementId: string) => void;
  className?: string;
}

// Base tokens for swapping (MAINNET ONLY)
const USDC_TOKEN: TokenType = {
  address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  chainId: base.id,
  decimals: 6,
  name: 'USD Coin',
  symbol: 'USDC',
  image: 'https://dynamic-assets.coinbase.com/3c15df5e2ac7d4abbe9499ed9335041f00c620f28e8de2f93474a9f432058580cda90b3745ff01d088c932b4f9b7f7e0f82fefc97e21db18a58ff5b9b8ab3e85/asset_icons/09c2b580f2374a9b9c7b7f9b4e4b5b2f4c9e06b8b8e6e6e6b6b6b6b6b6b6b6b6.png',
};

const ETH_TOKEN: TokenType = {
  address: '0x4200000000000000000000000000000000000006',
  chainId: base.id,
  decimals: 18,
  name: 'Wrapped Ethereum',
  symbol: 'WETH',
  image: 'https://dynamic-assets.coinbase.com/dbb4b4983bde81309ddab83eb598358eb44375b930b94687ebe38bc22e52c3b2125258ffb8477a5ef22e33d6bd72e32a506c391caa13af64c00e46613c3e5806/asset_icons/4113b082d21cc5fab17fc8f2d19fb996165bcce635e6900f7fc2d57c4ef33ae9.png',
};

export function SwapTutorial({ onAchievementUnlock, className = "" }: SwapTutorialProps) {
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const sendNotification = useNotification();
  
  const [swapCount, setSwapCount] = useState(0);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [isNetworkSwitching, setIsNetworkSwitching] = useState(false);
  
  // Check if user is on Base Mainnet (required for Swap)
  const isOnBaseMainnet = chainId === base.id;
  const needsNetworkSwitch = !isOnBaseMainnet && address;
  
  const swappableTokens: TokenType[] = useMemo(() => [
    USDC_TOKEN,
    ETH_TOKEN,
  ], []);
  
  // Handle network switching to Base Mainnet
  const handleSwitchToMainnet = useCallback(async () => {
    if (!switchChain) return;
    
    setIsNetworkSwitching(true);
    try {
      await switchChain({ chainId: base.id });
      await sendNotification({
        title: "Switched to Base Mainnet! 🌐",
        body: "Ready for token swapping!"
      });
    } catch (error) {
      console.error('Failed to switch network:', error);
      await sendNotification({
        title: "Network Switch Failed ❌",
        body: "Please manually switch to Base Mainnet in your wallet"
      });
    }
    setIsNetworkSwitching(false);
  }, [switchChain, sendNotification]);
  
  const handleSwapSuccess = useCallback(async () => {
    const newSwapCount = swapCount + 1;
    setSwapCount(newSwapCount);
    
    // First swap achievement
    if (newSwapCount === 1 && onAchievementUnlock) {
      onAchievementUnlock('first_swap');
      await sendNotification({
        title: "First Swap Complete! 🎉",
        body: "You've successfully completed your first token swap on Base!"
      });
    }
    
    // Swap expert achievement (5 swaps)
    if (newSwapCount === 5 && onAchievementUnlock) {
      onAchievementUnlock('swap_expert');
      await sendNotification({
        title: "Swap Expert! 🏆",
        body: "You've completed 5 swaps and become a trading expert!"
      });
    }
    
    // Move tutorial forward
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    }
  }, [swapCount, onAchievementUnlock, sendNotification, tutorialStep]);
  
  const tutorialSteps = [
    {
      title: "Welcome to Token Swapping! 🔄",
      content: "Learn how to swap tokens seamlessly on Base using OnchainKit. Swapping allows you to exchange one token for another instantly.",
      action: needsNetworkSwitch ? "Switch to Base Mainnet first" : "Let's start by selecting tokens to swap"
    },
    {
      title: "Switch to Base Mainnet",
      content: "OnchainKit Swap requires Base Mainnet to access real liquidity pools. Click the button below to switch networks.",
      action: "Switch to Base Mainnet"
    },
    {
      title: "Select Your Tokens",
      content: "Choose which token you want to swap FROM and which token you want to receive. You can swap between USDC, ETH, and BASE tokens.",
      action: "Select your tokens above"
    },
    {
      title: "Enter Swap Amount",
      content: "Enter how much you want to swap. The system will automatically calculate how much you'll receive based on current market rates.",
      action: "Enter an amount and execute your first swap"
    },
    {
      title: "Execute the Swap",
      content: "Click the swap button to execute your transaction. Note: Mainnet swaps use real gas fees (unlike other tutorials with Paymaster).",
      action: "Complete your swap to earn achievement"
    },
    {
      title: "Congratulations! 🎉",
      content: "You've completed the swap tutorial! You can now trade tokens like a pro. Keep swapping to unlock more achievements.",
      action: "Continue exploring other features"
    }
  ];
  
  const currentStep = tutorialSteps[tutorialStep];
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Network Status Alert */}
      {needsNetworkSwitch && (
        <div className="bg-yellow-100 dark:bg-yellow-900 rounded-xl p-4 border border-yellow-300 dark:border-yellow-700">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-2xl">⚠️</span>
            <h3 className="font-bold text-yellow-800 dark:text-yellow-200">
              Network Switch Required
            </h3>
          </div>
          <p className="text-yellow-700 dark:text-yellow-300 mb-4">
            OnchainKit Swap only works on Base Mainnet. You're currently on {chainId === baseSepolia.id ? 'Base Sepolia' : 'another network'}.
          </p>
          <button
            onClick={handleSwitchToMainnet}
            disabled={isNetworkSwitching}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isNetworkSwitching ? "Switching..." : "Switch to Base Mainnet"}
          </button>
        </div>
      )}

      {/* Tutorial Progress */}
      {showTutorial && (
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[var(--app-foreground)]">
              Swap Tutorial
            </h3>
            <button
              onClick={() => setShowTutorial(false)}
              className="text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-[var(--app-gray)] rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-[var(--app-accent)] to-[var(--app-accent-hover)] h-2 rounded-full transition-all duration-500"
              style={{ width: `${((tutorialStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-[var(--app-foreground)]">
              {currentStep.title}
            </h4>
            <p className="text-[var(--app-foreground-muted)]">
              {currentStep.content}
            </p>
            <div className="text-sm font-medium text-[var(--app-accent)]">
              👉 {currentStep.action}
            </div>
          </div>
          
          <div className="text-xs text-[var(--app-foreground-muted)] mt-4">
            Step {tutorialStep + 1} of {tutorialSteps.length}
          </div>
        </div>
      )}
      
      {/* Swap Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-4 border border-[var(--app-card-border)]">
          <div className="text-2xl font-bold text-[var(--app-accent)]">{swapCount}</div>
          <div className="text-sm text-[var(--app-foreground-muted)]">Total Swaps</div>
        </div>
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-4 border border-[var(--app-card-border)]">
          <div className="text-2xl font-bold text-[var(--app-accent)]">
            {isOnBaseMainnet ? '🌐' : '⚠️'}
          </div>
          <div className="text-sm text-[var(--app-foreground-muted)]">
            {isOnBaseMainnet ? 'Base Mainnet' : 'Wrong Network'}
          </div>
        </div>
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-4 border border-[var(--app-card-border)]">
          <div className="text-2xl font-bold text-[var(--app-accent)]">
            {swapCount >= 5 ? '🏆' : swapCount >= 1 ? '⭐' : '🔄'}
          </div>
          <div className="text-sm text-[var(--app-foreground-muted)]">
            {swapCount >= 5 ? 'Expert Trader' : swapCount >= 1 ? 'First Swap Done' : 'Ready to Swap'}
          </div>
        </div>
      </div>
      
      {/* Main Swap Interface */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[var(--app-foreground)]">
            Token Swap
          </h3>
          <div className="text-sm text-[var(--app-foreground-muted)]">
            Powered by OnchainKit
          </div>
        </div>
        
        {address && isOnBaseMainnet ? (
          <div className="space-y-4">
            <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-4">
              <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                💡 Before Swapping
              </h5>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Make sure you have ETH or other tokens in your wallet on Base Mainnet. You can:
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Bridge from Ethereum to Base using the official bridge</li>
                <li>• Buy ETH directly on Base through Coinbase</li>
                <li>• Use the Checkout tutorial to purchase crypto</li>
              </ul>
            </div>
            
            <Swap
              onSuccess={handleSwapSuccess}
              onError={(error) => {
                console.error('Swap failed:', error);
                sendNotification({
                  title: "Swap Failed ❌",
                  body: "Make sure you have sufficient balance and try again"
                });
              }}
              config={{
                maxSlippage: 5, // Increased slippage tolerance
              }}
            >
              <SwapAmountInput
                label="Sell"
                token={ETH_TOKEN}
                type="from"
              />
              <SwapToggleButton />
              <SwapAmountInput
                label="Buy"
                token={USDC_TOKEN}
                type="to"
              />
              <SwapButton />
              <SwapMessage />
              <SwapToast />
            </Swap>
          </div>
        ) : address && !isOnBaseMainnet ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🌐</div>
            <h4 className="text-lg font-semibold text-[var(--app-foreground)] mb-2">
              Switch to Base Mainnet
            </h4>
            <p className="text-[var(--app-foreground-muted)] mb-6">
              Swap requires Base Mainnet to access real liquidity pools
            </p>
            <button
              onClick={handleSwitchToMainnet}
              disabled={isNetworkSwitching}
              className="bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isNetworkSwitching ? "Switching..." : "Switch to Base Mainnet"}
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔌</div>
            <h4 className="text-lg font-semibold text-[var(--app-foreground)] mb-2">
              Connect Your Wallet
            </h4>
            <p className="text-[var(--app-foreground-muted)]">
              Connect your Smart Wallet to start swapping tokens
            </p>
          </div>
        )}
      </div>
      
      {/* Available Tokens */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <h4 className="text-lg font-semibold text-[var(--app-foreground)] mb-4">
          Available Tokens on Base Mainnet
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {swappableTokens.map((token) => (
            <TokenDisplay key={token.address} token={token} />
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
            💡 Pro Tip
          </h5>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Get some ETH on Base Mainnet from Coinbase or bridge from Ethereum to start swapping!
          </p>
        </div>
      </div>
    </div>
  );
}

interface TokenDisplayProps {
  token: TokenType;
}

function TokenDisplay({ token }: TokenDisplayProps) {
  return (
    <div className="flex items-center space-x-3 p-3 bg-[var(--app-gray)] rounded-lg">
      <TokenImage token={token} size={32} />
      <div>
        <div className="font-medium text-[var(--app-foreground)]">
          {token.symbol}
        </div>
        <div className="text-sm text-[var(--app-foreground-muted)]">
          {token.name}
        </div>
      </div>
    </div>
  );
}

export default SwapTutorial; 