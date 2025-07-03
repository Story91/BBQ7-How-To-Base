"use client";

import React, { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useNotification } from '@coinbase/onchainkit/minikit';
import Subscribe from '../Subscribe';

interface SpendPermissionsTutorialProps {
  onAchievementUnlock?: (achievementId: string) => void;
  className?: string;
}

export function SpendPermissionsTutorial({ onAchievementUnlock, className = "" }: SpendPermissionsTutorialProps) {
  const { isConnected } = useAccount();
  const sendNotification = useNotification();
  
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);

  const tutorialSteps = [
    {
      title: "Welcome to Spend Permissions! 🔐",
      content: "Learn how to create spend permissions that allow apps to spend your tokens automatically within limits you set. This is the future of frictionless web3 UX!",
      action: "Connect your Smart Wallet to get started"
    },
    {
      title: "Understanding Spend Permissions 📋",
      content: "Spend permissions let you authorize apps to spend your tokens up to a certain amount over a specific time period. It's like setting up a recurring payment but with full control.",
      action: "Learn about subscription models"
    },
    {
      title: "Create Your First Permission 🚀",
      content: "Now let's create your first spend permission! You'll sign a message that allows our app to collect a small subscription fee automatically.",
      action: "Create a spend permission below"
    },
    {
      title: "Permission Master! 🎉",
      content: "Congratulations! You've mastered spend permissions. This technology enables subscription services, automated DeFi strategies, and seamless recurring payments.",
      action: "Explore other Base features"
    }
  ];
  
  const currentStep = tutorialSteps[tutorialStep];
  
  const benefits = [
    {
      title: "No More Popups",
      description: "Users don&apos;t need to confirm every transaction",
      icon: "🚫",
      color: "bg-red-100 dark:bg-red-900"
    },
    {
      title: "Automated Payments",
      description: "Perfect for subscriptions and recurring services",
      icon: "🔄",
      color: "bg-blue-100 dark:bg-blue-900"
    },
    {
      title: "User Control",
      description: "Users set spending limits and can revoke anytime",
      icon: "🎛️",
      color: "bg-green-100 dark:bg-green-900"
    },
    {
      title: "Gas Efficient",
      description: "Batch multiple operations in single transactions",
      icon: "⚡",
      color: "bg-yellow-100 dark:bg-yellow-900"
    }
  ];

  const useCases = [
    {
      category: "Subscriptions",
      examples: ["Monthly SaaS payments", "Streaming services", "Premium memberships"],
      icon: "📱"
    },
    {
      category: "DeFi",
      examples: ["Automated yield farming", "Dollar-cost averaging", "Rebalancing strategies"],
      icon: "🌾"
    },
    {
      category: "Gaming",
      examples: ["In-game purchases", "Season passes", "Cosmetic items"],
      icon: "🎮"
    },
    {
      category: "Creator Economy",
      examples: ["Patron subscriptions", "Content tipping", "Creator support"],
      icon: "🎨"
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tutorial Progress */}
      {showTutorial && (
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[var(--app-foreground)]">
              Spend Permissions Tutorial
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

      {/* Benefits Overview */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <h3 className="text-xl font-bold text-[var(--app-foreground)] mb-4">
          🔐 Why Spend Permissions?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${benefit.color}`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{benefit.icon}</span>
                <h4 className="font-semibold text-[var(--app-foreground)]">
                  {benefit.title}
                </h4>
              </div>
              <p className="text-sm text-[var(--app-foreground-muted)]">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Demo */}
      {isConnected ? (
        <Subscribe />
      ) : (
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-8 border border-[var(--app-card-border)] text-center">
          <div className="text-6xl mb-4">🔌</div>
          <h3 className="text-2xl font-bold text-[var(--app-foreground)] mb-4">
            Connect Your Smart Wallet
          </h3>
          <p className="text-[var(--app-foreground-muted)] mb-6">
            Connect your Smart Wallet to try spend permissions
          </p>
          <div className="text-sm text-[var(--app-foreground-muted)]">
            Make sure you're using a Smart Wallet for the best experience
          </div>
        </div>
      )}

      {/* Use Cases */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <h3 className="text-xl font-bold text-[var(--app-foreground)] mb-4">
          📊 Spend Permission Use Cases
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="p-4 bg-[var(--app-gray)] rounded-lg"
            >
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">{useCase.icon}</span>
                <h4 className="font-semibold text-[var(--app-foreground)]">
                  {useCase.category}
                </h4>
              </div>
              <ul className="text-sm text-[var(--app-foreground-muted)] space-y-1">
                {useCase.examples.map((example, i) => (
                  <li key={i}>• {example}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <h3 className="text-xl font-bold text-[var(--app-foreground)] mb-4">
          🛠️ How It Works
        </h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-[var(--app-accent)] text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h4 className="font-medium text-[var(--app-foreground)]">Create Permission</h4>
              <p className="text-sm text-[var(--app-foreground-muted)]">
                Define spending limits, time periods, and authorized tokens
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-[var(--app-accent)] text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h4 className="font-medium text-[var(--app-foreground)]">Sign Authorization</h4>
              <p className="text-sm text-[var(--app-foreground-muted)]">
                User signs a message authorizing the spend permission
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-[var(--app-accent)] text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h4 className="font-medium text-[var(--app-foreground)]">Approve On-Chain</h4>
              <p className="text-sm text-[var(--app-foreground-muted)]">
                Permission is registered with the SpendPermissionManager contract
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-[var(--app-accent)] text-white rounded-full flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <h4 className="font-medium text-[var(--app-foreground)]">Automated Spending</h4>
              <p className="text-sm text-[var(--app-foreground-muted)]">
                App can now spend within limits without user confirmation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Tips */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <h4 className="font-semibold text-[var(--app-foreground)] mb-3">
          💡 Spend Permission Pro Tips
        </h4>
        <ul className="space-y-2 text-sm text-[var(--app-foreground-muted)]">
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Start with small amounts and short periods when testing</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Users can revoke permissions anytime through their wallet</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Combine with Sub Accounts for advanced use cases</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Perfect for subscription-based business models</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default SpendPermissionsTutorial; 