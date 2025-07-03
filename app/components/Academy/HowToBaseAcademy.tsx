"use client";

import React, { useState } from 'react';
import { AchievementSystem } from './AchievementSystem';
import { SwapTutorial } from '../Tutorials/SwapTutorial';
import { WalletTutorial } from '../Tutorials/WalletTutorial';
import { TransactionTutorial } from '../Tutorials/TransactionTutorial';
import { SpendPermissionsTutorial } from '../Tutorials/SpendPermissionsTutorial';
import { MintTutorial } from '../Tutorials/MintTutorial';
import { BasenamesTutorial } from '../Tutorials/BasenamesTutorial';
import { CheckoutTutorial } from '../Tutorials/CheckoutTutorial';

type TutorialTab = 'achievements' | 'wallet' | 'transactions' | 'swap' | 'permissions' | 'nft' | 'identity' | 'defi' | 'advanced';

interface HowToBaseAcademyProps {
  className?: string;
  setActiveTab?: (tab: string) => void;
  onBack?: () => void;
}

export function HowToBaseAcademy({ className = "", setActiveTab, onBack }: HowToBaseAcademyProps) {
  const [activeTutorialTab, setActiveTutorialTab] = useState<TutorialTab>('achievements');
  
  const handleAchievementUnlock = (achievementId: string) => {
    console.log('Achievement unlocked:', achievementId);
    // This will be handled by the AchievementSystem component
  };

  const tabs = [
    {
      id: 'achievements' as TutorialTab,
      name: 'Achievements',
      icon: '🏆',
      description: 'Track your progress'
    },
    {
      id: 'swap' as TutorialTab,
      name: 'Token Swap',
      icon: '🔄',
      description: 'Learn token swapping'
    },
    {
      id: 'wallet' as TutorialTab,
      name: 'Smart Wallet',
      icon: '🧠',
      description: 'Smart Wallet + Sub Accounts'
    },
    {
      id: 'transactions' as TutorialTab,
      name: 'Transactions',
      icon: '⛽',
      description: 'Sponsored transactions'
    },
    {
      id: 'permissions' as TutorialTab,
      name: 'Spend Permissions',
      icon: '🔐',
      description: 'Automated subscriptions'
    },
    {
      id: 'nft' as TutorialTab,
      name: 'NFTs',
      icon: '🎨',
      description: 'Mint and collect NFTs'
    },
    {
      id: 'identity' as TutorialTab,
      name: 'Identity',
      icon: '🏷️',
      description: 'Basenames & profiles'
    },
    {
      id: 'defi' as TutorialTab,
      name: 'Commerce',
      icon: '🛒',
      description: 'Crypto payments'
    },
    {
      id: 'advanced' as TutorialTab,
      name: 'Advanced',
      icon: '🚀',
      description: 'Advanced features'
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[var(--app-bg)] to-[var(--app-bg-alternate)] ${className}`}>
      {/* Header */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md border-b border-[var(--app-card-border)] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🎓</div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--app-foreground)]">
                  HowToBase Academy
                </h1>
                <p className="text-[var(--app-foreground-muted)]">
                  Learn Base builder tools through interactive tutorials
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {setActiveTab && (
                <button
                  onClick={() => setActiveTab?.("home")}
                  className="text-sm text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] transition-colors"
                >
                  ← Back to Home
                </button>
              )}
              <div className="text-sm text-[var(--app-foreground-muted)]">
                Powered by OnchainKit
              </div>
              <div className="px-3 py-1 bg-[var(--app-accent)] text-white text-sm rounded-full">
                Beta
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex space-x-2 overflow-x-auto pb-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTutorialTab(tab.id)}
              className={`flex flex-col items-center space-y-1 px-4 py-3 rounded-xl whitespace-nowrap transition-all min-w-[100px] ${
                activeTutorialTab === tab.id
                  ? 'bg-[var(--app-accent)] text-white shadow-lg scale-105'
                  : 'bg-[var(--app-card-bg)] text-[var(--app-foreground)] hover:bg-[var(--app-gray)] hover:scale-102'
              }`}
            >
              <span className="text-2xl">{tab.icon}</span>
              <span className="text-sm font-medium">{tab.name}</span>
              <span className="text-xs opacity-75">{tab.description}</span>
            </button>
          ))}
        </div>

        {/* Tutorial Content */}
        <div className="space-y-6">
          {activeTutorialTab === 'achievements' && (
            <AchievementSystem className="animate-fadeIn" />
          )}
          
          {activeTutorialTab === 'swap' && (
            <SwapTutorial 
              onAchievementUnlock={handleAchievementUnlock}
              className="animate-fadeIn" 
            />
          )}
          
          {activeTutorialTab === 'wallet' && (
            <WalletTutorial 
              onAchievementUnlock={handleAchievementUnlock}
              className="animate-fadeIn" 
            />
          )}
          
          {activeTutorialTab === 'transactions' && (
            <TransactionTutorial 
              onAchievementUnlock={handleAchievementUnlock}
              className="animate-fadeIn" 
            />
          )}
          
          {activeTutorialTab === 'permissions' && (
            <SpendPermissionsTutorial 
              onAchievementUnlock={handleAchievementUnlock}
              className="animate-fadeIn" 
            />
          )}
          
          {activeTutorialTab === 'nft' && (
            <MintTutorial 
              onAchievementUnlock={handleAchievementUnlock}
              className="animate-fadeIn" 
            />
          )}
          
          {activeTutorialTab === 'identity' && (
            <BasenamesTutorial 
              onAchievementUnlock={handleAchievementUnlock}
              className="animate-fadeIn" 
            />
          )}
          
          {activeTutorialTab === 'defi' && (
            <CheckoutTutorial 
              onAchievementUnlock={handleAchievementUnlock}
              className="animate-fadeIn" 
            />
          )}
          
          {activeTutorialTab === 'advanced' && (
            <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-8 border border-[var(--app-card-border)] text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-[var(--app-foreground)] mb-4">
                Advanced Features
              </h3>
              <p className="text-[var(--app-foreground-muted)] mb-6">
                Master advanced Base features like spend permissions and sub-accounts
              </p>
              <div className="px-4 py-2 bg-[var(--app-accent)] text-white rounded-lg inline-block">
                Coming Soon
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HowToBaseAcademy; 