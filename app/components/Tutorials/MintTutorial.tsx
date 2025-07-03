"use client";

import React, { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useNotification } from '@coinbase/onchainkit/minikit';

interface MintTutorialProps {
  onAchievementUnlock?: (achievementId: string) => void;
  className?: string;
}

export function MintTutorial({ onAchievementUnlock, className = "" }: MintTutorialProps) {
  const { address, isConnected } = useAccount();
  const sendNotification = useNotification();
  
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [mintedCount, setMintedCount] = useState(0);
  
  const handleMintSuccess = useCallback(async () => {
    const newCount = mintedCount + 1;
    setMintedCount(newCount);
    
    if (newCount === 1 && onAchievementUnlock) {
      onAchievementUnlock('first_nft_mint');
      await sendNotification({
        title: "First NFT Minted! 🎨",
        body: "You've successfully minted your first NFT on Base!"
      });
    }
    
    // Move tutorial forward
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    }
  }, [mintedCount, onAchievementUnlock, sendNotification, tutorialStep]);

  const tutorialSteps = [
    {
      title: "Welcome to NFT Minting! 🎨",
      content: "Learn how to mint NFTs on Base! NFTs are unique digital assets that can represent art, collectibles, game items, and more.",
      action: "Connect your wallet to get started"
    },
    {
      title: "Understanding NFTs 📚",
      content: "NFTs (Non-Fungible Tokens) are unique blockchain assets. Unlike cryptocurrencies, each NFT is one-of-a-kind and cannot be replaced with another.",
      action: "Learn about NFT standards"
    },
    {
      title: "Mint Your First NFT! 🚀",
      content: "Now let's mint your first NFT! We'll create a simple collectible that represents your journey learning Base.",
      action: "Mint an NFT below"
    },
    {
      title: "NFT Master! 🎉",
      content: "Congratulations! You've minted your first NFT on Base. NFTs open up endless possibilities for creators and collectors.",
      action: "Explore other Base features"
    }
  ];
  
  const currentStep = tutorialSteps[tutorialStep];
  
  // Demo NFT collection data
  const demoNFTs = [
    {
      id: 1,
      name: "Base Explorer",
      description: "A badge for exploring the Base ecosystem",
      image: "🌊",
      rarity: "Common",
      attributes: [
        { trait: "Type", value: "Achievement Badge" },
        { trait: "Level", value: "Beginner" },
        { trait: "Network", value: "Base" }
      ]
    },
    {
      id: 2,
      name: "Smart Wallet Pioneer",
      description: "Commemorating your first Smart Wallet experience",
      image: "🧠",
      rarity: "Rare",
      attributes: [
        { trait: "Type", value: "Pioneer Badge" },
        { trait: "Level", value: "Advanced" },
        { trait: "Feature", value: "Smart Wallet" }
      ]
    },
    {
      id: 3,
      name: "DeFi Enthusiast",
      description: "For completing your first DeFi transaction",
      image: "🌾",
      rarity: "Epic",
      attributes: [
        { trait: "Type", value: "DeFi Badge" },
        { trait: "Level", value: "Expert" },
        { trait: "Protocol", value: "Base DeFi" }
      ]
    }
  ];

  const nftFeatures = [
    {
      title: "Gasless Minting",
      description: "Mint NFTs without paying gas fees using Paymaster",
      icon: "⛽",
      color: "bg-blue-100 dark:bg-blue-900"
    },
    {
      title: "Fast & Cheap",
      description: "Base L2 provides instant and affordable NFT minting",
      icon: "⚡",
      color: "bg-green-100 dark:bg-green-900"
    },
    {
      title: "ERC-721 Standard",
      description: "Full compatibility with all NFT marketplaces",
      icon: "🔗",
      color: "bg-purple-100 dark:bg-purple-900"
    },
    {
      title: "Rich Metadata",
      description: "Support for complex attributes and properties",
      icon: "📋",
      color: "bg-orange-100 dark:bg-orange-900"
    }
  ];

  const mintingProcess = [
    {
      step: 1,
      title: "Choose Collection",
      description: "Select or create an NFT collection contract",
      status: "completed"
    },
    {
      step: 2,
      title: "Define Metadata",
      description: "Set name, description, image, and attributes",
      status: isConnected ? "completed" : "pending"
    },
    {
      step: 3,
      title: "Sign Transaction",
      description: "Approve the minting transaction with your wallet",
      status: mintedCount > 0 ? "completed" : "pending"
    },
    {
      step: 4,
      title: "NFT Created",
      description: "Your unique NFT is now on the blockchain",
      status: mintedCount > 0 ? "completed" : "pending"
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tutorial Progress */}
      {showTutorial && (
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[var(--app-foreground)]">
              NFT Minting Tutorial
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-4 border border-[var(--app-card-border)]">
          <div className="text-2xl font-bold text-[var(--app-accent)]">{mintedCount}</div>
          <div className="text-sm text-[var(--app-foreground-muted)]">NFTs Minted</div>
        </div>
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-4 border border-[var(--app-card-border)]">
          <div className="text-2xl font-bold text-[var(--app-accent)]">3</div>
          <div className="text-sm text-[var(--app-foreground-muted)]">Collections</div>
        </div>
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-4 border border-[var(--app-card-border)]">
          <div className="text-2xl font-bold text-[var(--app-accent)]">Free</div>
          <div className="text-sm text-[var(--app-foreground-muted)]">Gas Fees</div>
        </div>
      </div>

      {/* NFT Features */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <h3 className="text-xl font-bold text-[var(--app-foreground)] mb-4">
          🎨 Why Mint NFTs on Base?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nftFeatures.map((feature, index) => (
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

      {/* Minting Demo */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <h3 className="text-xl font-bold text-[var(--app-foreground)] mb-4">
          🚀 Mint Demo NFTs
        </h3>
        
        {isConnected ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {demoNFTs.map((nft) => (
                <div
                  key={nft.id}
                  className="p-4 bg-[var(--app-gray)] rounded-lg hover:bg-[var(--app-card-border)] transition-colors"
                >
                  <div className="text-center mb-3">
                    <div className="text-6xl mb-2">{nft.image}</div>
                    <h4 className="font-semibold text-[var(--app-foreground)]">
                      {nft.name}
                    </h4>
                    <p className="text-sm text-[var(--app-foreground-muted)] mb-2">
                      {nft.description}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      nft.rarity === 'Common' ? 'bg-gray-200 text-gray-800' :
                      nft.rarity === 'Rare' ? 'bg-blue-200 text-blue-800' :
                      'bg-purple-200 text-purple-800'
                    }`}>
                      {nft.rarity}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {nft.attributes.map((attr, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-[var(--app-foreground-muted)]">{attr.trait}:</span>
                        <span className="text-[var(--app-foreground)]">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleMintSuccess}
                    className="w-full px-4 py-2 bg-[var(--app-accent)] text-white rounded-lg hover:bg-[var(--app-accent-hover)] transition-colors"
                  >
                    Mint NFT
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🔌</div>
            <h4 className="text-lg font-semibold text-[var(--app-foreground)] mb-2">
              Connect Your Wallet
            </h4>
            <p className="text-[var(--app-foreground-muted)]">
              Connect your wallet to start minting NFTs
            </p>
          </div>
        )}
      </div>

      {/* Minting Process */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <h3 className="text-xl font-bold text-[var(--app-foreground)] mb-4">
          🛠️ NFT Minting Process
        </h3>
        <div className="space-y-4">
          {mintingProcess.map((item) => (
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

      {/* Pro Tips */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <h4 className="font-semibold text-[var(--app-foreground)] mb-3">
          💡 NFT Pro Tips
        </h4>
        <ul className="space-y-2 text-sm text-[var(--app-foreground-muted)]">
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Use IPFS for storing NFT metadata and images permanently</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Consider royalties for ongoing creator compensation</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Base L2 makes NFT minting accessible to everyone</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Combine with Spend Permissions for subscription NFTs</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default MintTutorial; 