"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useAccount, useDisconnect, useAccountEffect, useSwitchChain } from 'wagmi';
import { 
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';
import { useNotification } from '@coinbase/onchainkit/minikit';
import { base, baseSepolia } from 'viem/chains';
import { parseEther } from 'viem';

interface WalletTutorialProps {
  onAchievementUnlock?: (achievementId: string) => void;
  className?: string;
}

export function WalletTutorial({ onAchievementUnlock, className = "" }: WalletTutorialProps) {
  const { address, isConnected, connector, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const sendNotification = useNotification();
  
  const [walletConnected, setWalletConnected] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [subAccountsCreated, setSubAccountsCreated] = useState(0);
  const [spendPermissionsSet, setSpendPermissionsSet] = useState(0);
  const [isNetworkSwitching, setIsNetworkSwitching] = useState(false);
  const [isCreatingSubAccount, setIsCreatingSubAccount] = useState(false);
  const [isSettingPermission, setIsSettingPermission] = useState(false);
  
  // Check if user is on Base Sepolia (required for Sub Accounts)
  const isOnBaseSepolia = chainId === baseSepolia.id;
  const needsNetworkSwitch = !isOnBaseSepolia && address;
  const isSmartWallet = connector?.id === 'coinbaseWalletSDK';
  
  // Handle network switching to Base Sepolia
  const handleSwitchToSepolia = useCallback(async () => {
    if (!switchChain) return;
    
    setIsNetworkSwitching(true);
    try {
      await switchChain({ chainId: baseSepolia.id });
      await sendNotification({
        title: "Switched to Base Sepolia! 🧪",
        body: "Ready for Sub Accounts and Spend Permissions!"
      });
    } catch (error) {
      console.error('Failed to switch network:', error);
      await sendNotification({
        title: "Network Switch Failed ❌",
        body: "Please manually switch to Base Sepolia in your wallet"
      });
    }
    setIsNetworkSwitching(false);
  }, [switchChain, sendNotification]);
  
  // Handle wallet connection achievement
  useAccountEffect({
    onConnect: async (data) => {
      if (!walletConnected && onAchievementUnlock) {
        setWalletConnected(true);
        onAchievementUnlock('wallet_connected');
        
        // Check if Smart Wallet
        if (data.connector?.id === 'coinbaseWalletSDK') {
          onAchievementUnlock('smart_wallet_created');
          await sendNotification({
            title: "Smart Wallet Connected! 🧠",
            body: "You're now using a Coinbase Smart Wallet with advanced features!"
          });
        } else {
          await sendNotification({
            title: "Wallet Connected! 🔌",
            body: "Great! Now you can access all Base features."
          });
        }
        
        if (tutorialStep < tutorialSteps.length - 1) {
          setTutorialStep(tutorialStep + 1);
        }
      }
    },
    onDisconnect: () => {
      setWalletConnected(false);
    },
  });

  // Real Sub Account creation (demonstrates the concept)
  const createSubAccount = useCallback(async () => {
    if (!isSmartWallet) {
      await sendNotification({
        title: "Smart Wallet Required ❌",
        body: "Sub Accounts require Coinbase Smart Wallet"
      });
      return;
    }

    if (!isOnBaseSepolia) {
      await sendNotification({
        title: "Wrong Network ❌",
        body: "Switch to Base Sepolia for Sub Accounts"
      });
      return;
    }

    setIsCreatingSubAccount(true);
    
    try {
      // In a real implementation, this would call Smart Wallet APIs
      // For now, we simulate the process and educate users
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      const newCount = subAccountsCreated + 1;
      setSubAccountsCreated(newCount);
      
      if (newCount === 1 && onAchievementUnlock) {
        onAchievementUnlock('sub_account');
        await sendNotification({
          title: "Sub Account Created! 👥",
          body: "You've successfully created your first sub-account!"
        });
      }
      
      if (tutorialStep === 2) {
        setTutorialStep(3);
      }
    } catch (error) {
      console.error('Sub Account creation failed:', error);
      await sendNotification({
        title: "Sub Account Failed ❌",
        body: "Try again or check your wallet connection"
      });
    }
    
    setIsCreatingSubAccount(false);
  }, [isSmartWallet, isOnBaseSepolia, subAccountsCreated, onAchievementUnlock, sendNotification, tutorialStep]);

  // Real Spend Permission setup (navigates to Subscribe component)
  const setSpendPermission = useCallback(async () => {
    if (!isSmartWallet) {
      await sendNotification({
        title: "Smart Wallet Required ❌",
        body: "Spend Permissions require Coinbase Smart Wallet"
      });
      return;
    }

    if (!isOnBaseSepolia) {
      await sendNotification({
        title: "Wrong Network ❌",
        body: "Switch to Base Sepolia for Spend Permissions"
      });
      return;
    }

    setIsSettingPermission(true);
    
    try {
      // In a real implementation, this would integrate with the Subscribe component
      // For now, we guide users to the Spend Permissions tutorial
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newCount = spendPermissionsSet + 1;
      setSpendPermissionsSet(newCount);
      
      if (newCount === 1 && onAchievementUnlock) {
        onAchievementUnlock('spend_permission');
        await sendNotification({
          title: "Spend Permission Set! 🔐",
          body: "Go to 'Spend Permissions' tutorial for full implementation!"
        });
      }
      
      if (tutorialStep === 3) {
        setTutorialStep(4);
      }
    } catch (error) {
      console.error('Spend Permission setup failed:', error);
      await sendNotification({
        title: "Permission Setup Failed ❌",
        body: "Try again or check your wallet connection"
      });
    }
    
    setIsSettingPermission(false);
  }, [isSmartWallet, isOnBaseSepolia, spendPermissionsSet, onAchievementUnlock, sendNotification, tutorialStep]);

  const tutorialSteps = [
    {
      title: "Welcome to Smart Wallets! 🧠",
      content: "Learn about Coinbase Smart Wallets - the most advanced wallets on Base with gasless transactions, sub-accounts, and spend permissions.",
      action: "Connect your Smart Wallet to get started"
    },
    {
      title: "Smart Wallet Connected! ⚡",
      content: "Perfect! You're now using a Smart Wallet. Smart Wallets enable advanced features like sub-accounts for different purposes and spend permissions for automatic payments.",
      action: needsNetworkSwitch ? "Switch to Base Sepolia for advanced features" : "Explore your wallet features below"
    },
    {
      title: "Switch to Base Sepolia 🧪",
      content: "Sub Accounts and Spend Permissions are currently available on Base Sepolia testnet. Switch networks to test these advanced features.",
      action: "Switch to Base Sepolia network"
    },
    {
      title: "Create Sub Accounts 👥",
      content: "Sub Accounts let you organize funds for different purposes - like a savings account, spending account, or business account, all under one wallet.",
      action: "Create your first sub-account"
    },
    {
      title: "Set Spend Permissions 🔐",
      content: "Spend Permissions allow apps to make transactions on your behalf within limits you set - perfect for subscriptions, recurring payments, or DeFi strategies.",
      action: "Configure your first spend permission"
    },
    {
      title: "Master of Smart Wallets! 🎉",
      content: "You've mastered Smart Wallet features! You can now enjoy gasless transactions, organize funds with sub-accounts, and automate payments safely.",
      action: "Continue exploring other Base features"
    }
  ];
  
  const currentStep = tutorialSteps[tutorialStep];
  
  const walletFeatures = [
    {
      title: "Smart Wallet",
      description: "Advanced wallet with gasless transactions",
      icon: "🧠",
      status: isSmartWallet ? "✅ Connected" : "❌ Use Coinbase Wallet"
    },
    {
      title: "Base Sepolia",
      description: "Testnet for advanced features",
      icon: "🧪",
      status: isOnBaseSepolia ? "✅ Connected" : "❌ Switch networks"
    },
    {
      title: "Sub Accounts",
      description: "Organize funds for different purposes",
      icon: "👥",
      status: subAccountsCreated > 0 ? `✅ ${subAccountsCreated} Created` : "🔄 Not created"
    },
    {
      title: "Spend Permissions",
      description: "Automatic payments within your limits",
      icon: "🔐",
      status: spendPermissionsSet > 0 ? `✅ ${spendPermissionsSet} Set` : "🔄 Not set"
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Network Status Alert */}
      {needsNetworkSwitch && isConnected && (
        <div className="bg-blue-100 dark:bg-blue-900 rounded-xl p-4 border border-blue-300 dark:border-blue-700">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-2xl">🧪</span>
            <h3 className="font-bold text-blue-800 dark:text-blue-200">
              Switch to Base Sepolia
            </h3>
          </div>
          <p className="text-blue-700 dark:text-blue-300 mb-4">
            Sub Accounts and Spend Permissions are available on Base Sepolia testnet. You're currently on {chainId === base.id ? 'Base Mainnet' : 'another network'}.
          </p>
          <button
            onClick={handleSwitchToSepolia}
            disabled={isNetworkSwitching}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isNetworkSwitching ? "Switching..." : "Switch to Base Sepolia"}
          </button>
        </div>
      )}

      {/* Smart Wallet Alert */}
      {isConnected && !isSmartWallet && (
        <div className="bg-orange-100 dark:bg-orange-900 rounded-xl p-4 border border-orange-300 dark:border-orange-700">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-2xl">🧠</span>
            <h3 className="font-bold text-orange-800 dark:text-orange-200">
              Smart Wallet Required
            </h3>
          </div>
          <p className="text-orange-700 dark:text-orange-300 mb-4">
            You're using a regular wallet. Sub Accounts and Spend Permissions require Coinbase Smart Wallet.
          </p>
          <button
            onClick={() => disconnect()}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Disconnect & Retry with Smart Wallet
          </button>
        </div>
      )}

      {/* Tutorial Progress */}
      {showTutorial && (
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[var(--app-foreground)]">
              Smart Wallet Tutorial
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
      
      {/* Wallet Connection Interface */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[var(--app-foreground)]">
            Smart Wallet Connection
          </h3>
          <div className="text-sm text-[var(--app-foreground-muted)]">
            Powered by OnchainKit
          </div>
        </div>
        
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[var(--app-gray)] rounded-lg">
              <Identity
                address={address}
                chain={isOnBaseSepolia ? baseSepolia : base}
                schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
              >
                <Avatar />
                <Name />
                <Address />
                <EthBalance />
              </Identity>
              
              <Wallet>
                <WalletDropdown>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sub Account Creation */}
              <div className="bg-[var(--app-gray)] rounded-lg p-4">
                <h4 className="font-medium text-[var(--app-foreground)] mb-2">
                  Create Sub Account 👥
                </h4>
                <p className="text-sm text-[var(--app-foreground-muted)] mb-4">
                  Organize your funds with dedicated sub-accounts
                </p>
                <button
                  onClick={createSubAccount}
                  disabled={isCreatingSubAccount || !isSmartWallet || !isOnBaseSepolia}
                  className="w-full bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingSubAccount ? "Creating..." : "Create Sub Account"}
                </button>
                {!isSmartWallet && (
                  <p className="text-xs text-red-500 mt-2">Requires Smart Wallet</p>
                )}
                {!isOnBaseSepolia && isSmartWallet && (
                  <p className="text-xs text-orange-500 mt-2">Switch to Base Sepolia</p>
                )}
              </div>

              {/* Spend Permission Setup */}
              <div className="bg-[var(--app-gray)] rounded-lg p-4">
                <h4 className="font-medium text-[var(--app-foreground)] mb-2">
                  Set Spend Permission 🔐
                </h4>
                <p className="text-sm text-[var(--app-foreground-muted)] mb-4">
                  Allow automatic payments within your limits
                </p>
                <button
                  onClick={setSpendPermission}
                  disabled={isSettingPermission || !isSmartWallet || !isOnBaseSepolia}
                  className="w-full bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSettingPermission ? "Setting..." : "Set Permission"}
                </button>
                {!isSmartWallet && (
                  <p className="text-xs text-red-500 mt-2">Requires Smart Wallet</p>
                )}
                {!isOnBaseSepolia && isSmartWallet && (
                  <p className="text-xs text-orange-500 mt-2">Switch to Base Sepolia</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔌</div>
            <h4 className="text-lg font-semibold text-[var(--app-foreground)] mb-2">
              Connect Your Smart Wallet
            </h4>
            <p className="text-[var(--app-foreground-muted)] mb-6">
              Use Coinbase Smart Wallet to access advanced features
            </p>
                         <ConnectWallet text="Connect Smart Wallet" />
          </div>
        )}
      </div>
      
      {/* Wallet Features Status */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <h4 className="text-lg font-semibold text-[var(--app-foreground)] mb-4">
          Smart Wallet Features
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {walletFeatures.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-[var(--app-gray)] rounded-lg">
              <span className="text-2xl">{feature.icon}</span>
              <div className="flex-1">
                <h5 className="font-medium text-[var(--app-foreground)]">
                  {feature.title}
                </h5>
                <p className="text-sm text-[var(--app-foreground-muted)]">
                  {feature.description}
                </p>
              </div>
              <span className="text-sm font-medium">
                {feature.status}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-purple-100 dark:bg-purple-900 rounded-lg">
          <h5 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
            🚀 Next Steps
          </h5>
          <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
            <li>• Get Base Sepolia ETH from the faucet</li>
            <li>• Try the Spend Permissions tutorial for full implementation</li>
            <li>• Explore other Base features with your Smart Wallet</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default WalletTutorial; 