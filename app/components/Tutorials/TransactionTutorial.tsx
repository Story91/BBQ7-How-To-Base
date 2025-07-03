"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { 
  Transaction,
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
  TransactionToast,
  TransactionToastIcon,
  TransactionToastLabel,
  TransactionToastAction,
} from '@coinbase/onchainkit/transaction';
import type { TransactionError, LifecycleStatus } from '@coinbase/onchainkit/transaction';
import { useNotification } from '@coinbase/onchainkit/minikit';
import { demoContractCalls } from '@/lib/abi/DemoContract';

interface TransactionTutorialProps {
  onAchievementUnlock?: (achievementId: string) => void;
  className?: string;
}

export function TransactionTutorial({ onAchievementUnlock, className = "" }: TransactionTutorialProps) {
  const { address } = useAccount();
  const sendNotification = useNotification();
  
  const [transactionCount, setTransactionCount] = useState(0);
  const [sponsoredCount, setSponsoredCount] = useState(0);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  
  // Simple transaction calls - Set value in demo contract
  const simpleCalls = useMemo(() => address ? [
    demoContractCalls.setValue(Math.floor(Math.random() * 100) + 1)
  ] : [], [address]);
  
  // Increment transaction calls - Another single operation
  const incrementCalls = useMemo(() => address ? [
    demoContractCalls.increment(Math.floor(Math.random() * 10) + 1)
  ] : [], [address]);

  const handleTransactionSuccess = useCallback(async (isSponsored: boolean) => {
    const newTransactionCount = transactionCount + 1;
    setTransactionCount(newTransactionCount);
    
    if (isSponsored) {
      setSponsoredCount(sponsoredCount + 1);
    }
    
    // First transaction achievement
    if (newTransactionCount === 1 && onAchievementUnlock) {
      onAchievementUnlock('first_transaction');
      await sendNotification({
        title: "First Transaction! 💸",
        body: "You&apos;ve successfully sent your first transaction on Base!"
      });
    }
    
    // Sponsored transaction achievement
    if (isSponsored && sponsoredCount === 0 && onAchievementUnlock) {
      onAchievementUnlock('sponsored_transaction');
      await sendNotification({
        title: "Sponsored Transaction! ⛽",
        body: "Amazing! Your transaction was completely gas-free thanks to Paymaster!"
      });
    }
    
    // Move tutorial forward
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    }
  }, [transactionCount, sponsoredCount, onAchievementUnlock, sendNotification, tutorialStep]);

  const handleTransactionStatus = useCallback((status: LifecycleStatus) => {
    console.log('Transaction status:', status);
    
    if (status.statusName === 'success') {
      // Transaction is sponsored by Paymaster
      const isSponsored = true; // All our transactions use Paymaster
      handleTransactionSuccess(isSponsored);
    }
  }, [handleTransactionSuccess]);

  const tutorialSteps = [
    {
      title: "Welcome to Transactions! 💸",
      content: "Learn how to send transactions on Base. With Paymaster, your transactions can be completely gas-free!",
      action: "Send your first transaction"
    },
    {
      title: "Sponsored Transactions ⛽",
      content: "Amazing! That transaction was sponsored by Paymaster - you didn't pay any gas fees. This makes Base extremely user-friendly.",
      action: "Try an increment transaction next"
    },
    {
      title: "Transaction Master! 🎉",
      content: "You&apos;ve mastered Base transactions! You can now send gas-free transactions efficiently using Paymaster.",
      action: "Continue to other tutorials"
    }
  ];
  
  const currentStep = tutorialSteps[tutorialStep];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tutorial Progress */}
      {showTutorial && (
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[var(--app-foreground)]">
              Transaction Tutorial
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
      
      {/* Transaction Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-4 border border-[var(--app-card-border)]">
          <div className="text-2xl font-bold text-[var(--app-accent)]">{transactionCount}</div>
          <div className="text-sm text-[var(--app-foreground-muted)]">Total Transactions</div>
        </div>
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-4 border border-[var(--app-card-border)]">
          <div className="text-2xl font-bold text-[var(--app-accent)]">{sponsoredCount}</div>
          <div className="text-sm text-[var(--app-foreground-muted)]">Sponsored (Gas-Free)</div>
        </div>
      </div>

      {/* Simple Transaction */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[var(--app-foreground)]">
            Simple Sponsored Transaction
          </h3>
          <div className="text-sm text-[var(--app-foreground-muted)]">
            ⛽ Gas-Free
          </div>
        </div>
        
        {address ? (
          <Transaction
            calls={simpleCalls}
            onStatus={handleTransactionStatus}
            onError={(error: TransactionError) => console.error('Transaction failed:', error)}
            isSponsored={true} // Enable Paymaster sponsorship
          >
            <TransactionButton className="mb-4" />
            <TransactionSponsor />
            <TransactionStatus>
              <TransactionStatusLabel />
              <TransactionStatusAction />
            </TransactionStatus>
            <TransactionToast>
              <TransactionToastIcon />
              <TransactionToastLabel />
              <TransactionToastAction />
            </TransactionToast>
          </Transaction>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔌</div>
            <h4 className="text-lg font-semibold text-[var(--app-foreground)] mb-2">
              Connect Your Wallet
            </h4>
            <p className="text-[var(--app-foreground-muted)]">
              Connect your wallet to start sending transactions
            </p>
          </div>
        )}
      </div>

      {/* Increment Transaction */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[var(--app-foreground)]">
            Increment Transaction
          </h3>
          <div className="text-sm text-[var(--app-foreground-muted)]">
            ➕ Single Operation
          </div>
        </div>
        
        {address ? (
          <Transaction
            calls={incrementCalls}
            onStatus={(status) => {
              console.log('Increment transaction status:', status);
              if (status.statusName === 'success') {
                handleTransactionSuccess(true);
              }
            }}
            onError={(error: TransactionError) => console.error('Increment transaction failed:', error)}
            isSponsored={true}
          >
            <TransactionButton className="mb-4" />
            <TransactionSponsor />
            <TransactionStatus>
              <TransactionStatusLabel />
              <TransactionStatusAction />
            </TransactionStatus>
          </Transaction>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔌</div>
            <h4 className="text-lg font-semibold text-[var(--app-foreground)] mb-2">
              Connect Your Wallet
            </h4>
            <p className="text-[var(--app-foreground-muted)]">
              Connect your wallet to try increment transactions
            </p>
          </div>
        )}
      </div>

      {/* Paymaster Information */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <h4 className="font-semibold text-[var(--app-foreground)] mb-3">
          ⛽ About Paymaster
        </h4>
        <div className="space-y-4">
          <p className="text-[var(--app-foreground-muted)]">
            Paymaster makes transactions on Base completely gas-free for users. Here's how it works:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[var(--app-gray)] rounded-lg">
              <h5 className="font-medium text-[var(--app-foreground)] mb-2">For Users</h5>
              <ul className="text-sm text-[var(--app-foreground-muted)] space-y-1">
                <li>• No ETH needed for gas</li>
                <li>• Seamless transactions</li>
                <li>• Better user experience</li>
              </ul>
            </div>
            <div className="p-4 bg-[var(--app-gray)] rounded-lg">
              <h5 className="font-medium text-[var(--app-foreground)] mb-2">For Developers</h5>
              <ul className="text-sm text-[var(--app-foreground-muted)] space-y-1">
                <li>• Easy integration</li>
                <li>• Configurable limits</li>
                <li>• Analytics dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Tips */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <h4 className="font-semibold text-[var(--app-foreground)] mb-3">
          💡 Transaction Pro Tips
        </h4>
        <ul className="space-y-2 text-sm text-[var(--app-foreground-muted)]">
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Sponsored transactions remove friction for new crypto users</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Paymaster eliminates gas fees for better user experience</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Base L2 provides fast finality and low costs</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Smart Wallets enhance the transaction experience</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default TransactionTutorial; 