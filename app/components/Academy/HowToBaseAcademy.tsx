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
      icon: '🔒',
      description: 'Coming Soon - Basenames',
      disabled: true
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
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black ${className}`}>
              {/* Header */}
        <div className="bg-black/30 backdrop-blur-lg border-b border-blue-500/30 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🎓</div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    HowToBase Academy
                  </h1>
                  <p className="text-blue-200">
                    Learn Base builder tools through interactive tutorials
                  </p>
                </div>
              </div>
                          <div className="flex items-center space-x-4">
              {(setActiveTab || onBack) && (
                <button
                  onClick={() => onBack ? onBack() : setActiveTab?.("home")}
                  className="text-sm text-blue-300 hover:text-white transition-colors"
                >
                  ← Back to Home
                </button>
              )}
              <div className="text-sm text-blue-300">
                Powered by OnchainKit
              </div>
              <div className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm rounded-full">
                Beta
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex space-x-3 overflow-x-auto pb-2 mb-8 justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTutorialTab(tab.id)}
              disabled={tab.disabled}
              className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all min-w-[80px] h-[80px] ${
                tab.disabled 
                  ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700/30'
                  : activeTutorialTab === tab.id
                  ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-2xl scale-110 shadow-blue-500/30'
                  : 'bg-black/20 backdrop-blur-lg text-blue-200 hover:bg-black/30 hover:scale-105 border border-blue-500/20'
              }`}
              title={`${tab.name} - ${tab.description}`}
            >
              <span className="text-3xl">{tab.icon}</span>
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
            <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-8 border border-[var(--app-card-border)] text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold text-[var(--app-foreground)] mb-4">
                Basenames & Identity
              </h3>
              <p className="text-[var(--app-foreground-muted)] mb-6">
                Learn about Base identity system, ENS names, and profile management
              </p>
              <div className="px-4 py-2 bg-gray-600 text-white rounded-lg inline-block">
                Coming Soon
              </div>
            </div>
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