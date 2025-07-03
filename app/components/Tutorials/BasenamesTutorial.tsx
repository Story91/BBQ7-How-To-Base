"use client";

import React, { useState, useCallback } from 'react';
import { useAccount, useEnsName } from 'wagmi';
import { useNotification } from '@coinbase/onchainkit/minikit';
import { Identity, Avatar, Name, Badge } from '@coinbase/onchainkit/identity';
import { baseSepolia } from 'wagmi/chains';

interface BasenamesTutorialProps {
  onAchievementUnlock?: (achievementId: string) => void;
  className?: string;
}

export function BasenamesTutorial({ onAchievementUnlock, className = "" }: BasenamesTutorialProps) {
  const { address, isConnected } = useAccount();
  const sendNotification = useNotification();
  
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [registrationStep, setRegistrationStep] = useState(0);
  
  const { data: ensName } = useEnsName({
    address: address as `0x${string}`,
    chainId: baseSepolia.id,
  });

  const handleBasenameRegistered = useCallback(async () => {
    if (onAchievementUnlock) {
      onAchievementUnlock('basename_registered');
      await sendNotification({
        title: "Basename Registered! 🎯",
        body: "You&apos;ve successfully registered your first Basename on Base!"
      });
    }
    
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    }
  }, [onAchievementUnlock, sendNotification, tutorialStep]);

  const tutorialSteps = [
    {
      title: "Welcome to Basenames! 🎯",
      content: "Basenames are human-readable addresses on Base - like ENS but for the Base ecosystem. Replace long addresses with memorable names like 'alice.base.eth'.",
      action: "Learn about digital identity"
    },
    {
      title: "Why Basenames Matter 🌐",
      content: "Basenames make Web3 more accessible by replacing complex addresses with easy-to-remember names. They're your digital identity across the Base ecosystem.",
      action: "Explore identity features"
    },
    {
      title: "Register Your Basename! 📝",
      content: "Choose a unique name that represents you on Base. Your Basename will be your identity across all Base applications.",
      action: "Register a Basename below"
    },
    {
      title: "Identity Master! 🎉",
      content: "Congratulations! You now have a human-readable identity on Base. Use it for payments, social profiles, and more.",
      action: "Explore other Base features"
    }
  ];
  
  const currentStep = tutorialSteps[tutorialStep];
  
  // Demo addresses with Basenames
  const demoProfiles = [
    {
      address: "0x1234567890123456789012345678901234567890",
      basename: "alice.base.eth",
      avatar: "👩‍💻",
      bio: "DeFi enthusiast building on Base",
      badges: ["Pioneer", "Builder", "Community"],
      stats: { transactions: 156, nfts: 23, defi: 8 }
    },
    {
      address: "0x2345678901234567890123456789012345678901",
      basename: "bob.base.eth", 
      avatar: "👨‍🎨",
      bio: "NFT artist and collector",
      badges: ["Artist", "Collector", "Creator"],
      stats: { transactions: 89, nfts: 47, defi: 12 }
    },
    {
      address: "0x3456789012345678901234567890123456789012",
      basename: "charlie.base.eth",
      avatar: "🧑‍🔬",
      bio: "Protocol researcher and developer",
      badges: ["Researcher", "Developer", "Innovator"],
      stats: { transactions: 234, nfts: 15, defi: 31 }
    }
  ];

  const basenameFeatures = [
    {
      title: "Human-Readable",
      description: "Replace complex addresses with memorable names",
      icon: "🔗",
      color: "bg-blue-100 dark:bg-blue-900"
    },
    {
      title: "Cross-Platform",
      description: "Use your Basename across all Base applications",
      icon: "🌐",
      color: "bg-green-100 dark:bg-green-900"
    },
    {
      title: "Reverse Resolution",
      description: "Addresses automatically resolve to your Basename",
      icon: "🔄",
      color: "bg-purple-100 dark:bg-purple-900"
    },
    {
      title: "Rich Profiles",
      description: "Add avatars, bio, and social links to your identity",
      icon: "👤",
      color: "bg-orange-100 dark:bg-orange-900"
    }
  ];

  const registrationSteps = [
    {
      step: 1,
      title: "Choose Name",
      description: "Select an available basename",
      status: "completed"
    },
    {
      step: 2,
      title: "Check Availability",
      description: "Verify your chosen name is available",
      status: registrationStep >= 1 ? "completed" : "pending"
    },
    {
      step: 3,
      title: "Register & Pay",
      description: "Complete registration transaction",
      status: registrationStep >= 2 ? "completed" : "pending"
    },
    {
      step: 4,
      title: "Setup Profile",
      description: "Add avatar and profile information",
      status: registrationStep >= 3 ? "completed" : "pending"
    }
  ];

  const handleRegisterDemo = () => {
    setRegistrationStep(prev => Math.min(prev + 1, 3));
    if (registrationStep === 2) {
      handleBasenameRegistered();
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tutorial Progress */}
      {showTutorial && (
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[var(--app-foreground)]">
              Basenames Tutorial
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

      {/* Your Identity */}
      {isConnected && (
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
          <h3 className="text-xl font-bold text-[var(--app-foreground)] mb-4">
            🎯 Your Base Identity
          </h3>
          
          <div className="flex items-center space-x-4 p-4 bg-[var(--app-gray)] rounded-lg">
            <Identity
              address={address as `0x${string}`}
              chain={baseSepolia}
            >
              <Avatar />
              <Name />
              <Badge />
            </Identity>
          </div>
          
          {!ensName && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                💡 You don&apos;t have a Basename yet! Register one below to get your human-readable identity.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-4 border border-[var(--app-card-border)]">
          <div className="text-2xl font-bold text-[var(--app-accent)]">50K+</div>
          <div className="text-sm text-[var(--app-foreground-muted)]">Registered</div>
        </div>
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-4 border border-[var(--app-card-border)]">
          <div className="text-2xl font-bold text-[var(--app-accent)]">$5-20</div>
          <div className="text-sm text-[var(--app-foreground-muted)]">Annual Fee</div>
        </div>
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-4 border border-[var(--app-card-border)]">
          <div className="text-2xl font-bold text-[var(--app-accent)]">∞</div>
          <div className="text-sm text-[var(--app-foreground-muted)]">Apps Support</div>
        </div>
      </div>

      {/* Basename Features */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <h3 className="text-xl font-bold text-[var(--app-foreground)] mb-4">
          🌟 Basename Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {basenameFeatures.map((feature, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${feature.color}`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{feature.icon}</span>
                <h4 className="font-semibold text-[var(--app-foreground)]">
                  {feature.title}
                </h4>
              </div>
              <p className="text-sm text-[var(--app-foreground-muted)]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Demo */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <h3 className="text-xl font-bold text-[var(--app-foreground)] mb-4">
          📝 Register Your Basename
        </h3>
        
        <div className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="yourname"
              className="flex-1 px-4 py-2 bg-[var(--app-gray)] rounded-lg border border-[var(--app-card-border)] text-[var(--app-foreground)] placeholder-[var(--app-foreground-muted)]"
            />
            <span className="px-4 py-2 text-[var(--app-foreground-muted)]">.base.eth</span>
            <button
              onClick={handleRegisterDemo}
              className="px-6 py-2 bg-[var(--app-accent)] text-white rounded-lg hover:bg-[var(--app-accent-hover)] transition-colors"
            >
              {registrationStep === 0 ? 'Check' : 
               registrationStep === 1 ? 'Register' : 
               registrationStep === 2 ? 'Setup' : 'Done'}
            </button>
          </div>
          
          {registrationStep > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✅ {registrationStep === 1 ? 'Available! Ready to register.' :
                     registrationStep === 2 ? 'Registered! Setting up profile...' :
                     'Complete! Your Basename is ready.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Registration Process */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <h3 className="text-xl font-bold text-[var(--app-foreground)] mb-4">
          🛠️ Registration Process
        </h3>
        <div className="space-y-4">
          {registrationSteps.map((item) => (
            <div key={item.step} className="flex items-start space-x-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                item.status === 'completed' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-[var(--app-gray)] text-[var(--app-foreground-muted)]'
              }`}>
                {item.status === 'completed' ? '✓' : item.step}
              </div>
              <div>
                <h4 className="font-medium text-[var(--app-foreground)]">{item.title}</h4>
                <p className="text-sm text-[var(--app-foreground-muted)]">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Profiles */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <h3 className="text-xl font-bold text-[var(--app-foreground)] mb-4">
          👥 Base Community Profiles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {demoProfiles.map((profile, index) => (
            <div
              key={index}
              className="p-4 bg-[var(--app-gray)] rounded-lg hover:bg-[var(--app-card-border)] transition-colors"
            >
              <div className="text-center mb-3">
                <div className="text-4xl mb-2">{profile.avatar}</div>
                <h4 className="font-semibold text-[var(--app-accent)]">
                  {profile.basename}
                </h4>
                <p className="text-xs text-[var(--app-foreground-muted)] truncate">
                  {profile.address}
                </p>
                <p className="text-sm text-[var(--app-foreground-muted)] mt-2">
                  {profile.bio}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {profile.badges.map((badge, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 bg-[var(--app-accent)] text-white rounded-full"
                  >
                    {badge}
                  </span>
                ))}
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-semibold text-[var(--app-foreground)]">
                    {profile.stats.transactions}
                  </div>
                  <div className="text-[var(--app-foreground-muted)]">TXs</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-[var(--app-foreground)]">
                    {profile.stats.nfts}
                  </div>
                  <div className="text-[var(--app-foreground-muted)]">NFTs</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-[var(--app-foreground)]">
                    {profile.stats.defi}
                  </div>
                  <div className="text-[var(--app-foreground-muted)]">DeFi</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Tips */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <h4 className="font-semibold text-[var(--app-foreground)] mb-3">
          💡 Basename Pro Tips
        </h4>
        <ul className="space-y-2 text-sm text-[var(--app-foreground-muted)]">
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Choose a memorable name that represents your brand</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Set up reverse resolution so addresses show your Basename</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Add an avatar and bio to make your profile stand out</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Basenames work across all Base applications automatically</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default BasenamesTutorial; 