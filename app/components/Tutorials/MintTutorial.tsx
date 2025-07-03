"use client";

import React, { useState, useCallback } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { useSendCalls } from 'wagmi/experimental';
import { useNotification } from '@coinbase/onchainkit/minikit';
import { baseSepolia } from 'wagmi/chains';
import { encodeFunctionData, erc20Abi, parseUnits } from 'viem';
import { heroNFTAddress, heroNFTABI, USDC_BASE_SEPOLIA, heroNFTMetadata } from '@/lib/abi/HeroNFT';

interface MintTutorialProps {
  onAchievementUnlock?: (achievementId: string) => void;
  className?: string;
}

export function MintTutorial({ onAchievementUnlock, className = "" }: MintTutorialProps) {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const sendNotification = useNotification();
  const { sendCalls, data, error, isPending } = useSendCalls();
  
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [mintedCount, setMintedCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mintResult, setMintResult] = useState<{ success: boolean; error?: string; txHash?: string } | null>(null);
  
  // Handle successful minting
  const handleMintSuccess = useCallback(async () => {
    const newCount = mintedCount + 1;
    setMintedCount(newCount);
    
    if (newCount === 1 && onAchievementUnlock) {
      onAchievementUnlock('first_nft_mint');
      await sendNotification({
        title: "First Hero NFT Minted! 🎨",
        body: "You've successfully minted your first HowToBase Hero NFT!"
      });
    }
    
    setMintResult({
      success: true,
      txHash: typeof data === 'string' ? data : 'success'
    });
    
    // Move tutorial forward
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    }
    
    setIsProcessing(false);
  }, [mintedCount, onAchievementUnlock, sendNotification, tutorialStep, data]);

  // Handle minting transaction response
  React.useEffect(() => {
    if (data && isProcessing) {
      console.log('NFT Mint transaction completed:', data);
      handleMintSuccess();
    }
  }, [data, isProcessing, handleMintSuccess]);

  // Handle minting errors
  React.useEffect(() => {
    if (error && isProcessing) {
      console.error('NFT Mint error:', error);
      setMintResult({
        success: false,
        error: error.message || 'Minting failed'
      });
      setIsProcessing(false);
    }
  }, [error, isProcessing]);

  const tutorialSteps = [
    {
      title: "Welcome to NFT Minting! 🎨",
      content: "Learn how to mint your own HowToBase Hero NFT! This commemorative badge represents your journey in mastering the Base ecosystem.",
      action: "Connect your wallet to get started"
    },
    {
      title: "Understanding Hero NFTs 🦸",
      content: "Hero NFTs are unique achievement badges on the Base blockchain. Each one is a proof of your learning journey and expertise.",
      action: "Learn about the Hero collection"
    },
    {
      title: "Mint Your Hero NFT! 🚀",
      content: "Now let's mint your Hero NFT! You'll pay 1 USDC to create your unique achievement badge.",
      action: "Mint your Hero NFT below"
    },
    {
      title: "NFT Hero! 🎉",
      content: "Congratulations! You've minted your Hero NFT on Base. You're now officially a Base builder!",
      action: "Explore other Base features"
    }
  ];
  
  const currentStep = tutorialSteps[tutorialStep];

  // Mint Hero NFT function
  const mintHeroNFT = async () => {
    if (!address || !isConnected) {
      setMintResult({ success: false, error: "Please connect your wallet first" });
      return;
    }

    // Check if we're on Base Sepolia
    if (chain?.id !== baseSepolia.id) {
      try {
        await switchChain({ chainId: baseSepolia.id });
      } catch (switchError) {
        setMintResult({ 
          success: false, 
          error: "Please switch to Base Sepolia network" 
        });
        return;
      }
    }

    try {
      setIsProcessing(true);
      setMintResult(null);

      // Create batch transaction: approve USDC + mint NFT
      const calls = [
        // 1. Approve USDC spending for NFT contract
        {
          to: USDC_BASE_SEPOLIA,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: "approve",
            args: [heroNFTAddress, parseUnits("1", 6)], // 1 USDC
          }),
        },
        // 2. Mint the NFT
        {
          to: heroNFTAddress,
          data: encodeFunctionData({
            abi: heroNFTABI,
            functionName: "mint",
            args: [address],
          }),
        }
      ];

      sendCalls({
        calls,
        chainId: baseSepolia.id,
      });

    } catch (err) {
      console.error('Minting error:', err);
      setMintResult({
        success: false,
        error: err instanceof Error ? err.message : "Unknown minting error"
      });
      setIsProcessing(false);
    }
  };

  const nftFeatures = [
    {
      title: "Hero Achievement",
      description: "Unique badge proving your Base mastery",
      icon: "🏆",
      color: "bg-yellow-100 dark:bg-yellow-900"
    },
    {
      title: "USDC Payment",
      description: "Simple 1 USDC minting fee on Base Sepolia",
      icon: "💰",
      color: "bg-green-100 dark:bg-green-900"
    },
    {
      title: "Base Native",
      description: "Minted directly on Base L2 blockchain",
      icon: "🔗",
      color: "bg-blue-100 dark:bg-blue-900"
    },
    {
      title: "Permanent Badge",
      description: "Forever proof of your learning journey",
      icon: "🎯",
      color: "bg-purple-100 dark:bg-purple-900"
    }
  ];

  const mintingProcess = [
    {
      step: 1,
      title: "Connect Wallet",
      description: "Connect your Smart Wallet to Base Sepolia",
      status: isConnected ? "completed" : "pending"
    },
    {
      step: 2,
      title: "Approve USDC",
      description: "Allow the contract to spend 1 USDC",
      status: mintedCount > 0 ? "completed" : "pending"
    },
    {
      step: 3,
      title: "Mint NFT",
      description: "Create your unique Hero achievement badge",
      status: mintedCount > 0 ? "completed" : "pending"
    },
    {
      step: 4,
      title: "Hero Created!",
      description: "Your Hero NFT is now on the blockchain",
      status: mintedCount > 0 ? "completed" : "pending"
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tutorial Progress */}
      {showTutorial && (
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">
              Step {tutorialStep + 1} of {tutorialSteps.length}
            </h2>
            <button
              onClick={() => setShowTutorial(false)}
              className="text-purple-300 hover:text-white"
            >
              Skip Tutorial
            </button>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              {currentStep.title}
            </h3>
            <p className="text-purple-200">
              {currentStep.content}
            </p>
            
            {tutorialStep < tutorialSteps.length - 1 && (
              <button
                onClick={() => setTutorialStep(tutorialStep + 1)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {currentStep.action}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-black/20 backdrop-blur-lg rounded-xl p-4 border border-blue-500/30">
          <div className="text-2xl font-bold text-cyan-400">{mintedCount}</div>
          <div className="text-sm text-blue-200">Hero NFTs Minted</div>
        </div>
        <div className="bg-black/20 backdrop-blur-lg rounded-xl p-4 border border-blue-500/30">
          <div className="text-2xl font-bold text-cyan-400">1 USDC</div>
          <div className="text-sm text-blue-200">Minting Price</div>
        </div>
        <div className="bg-black/20 backdrop-blur-lg rounded-xl p-4 border border-blue-500/30">
          <div className="text-2xl font-bold text-cyan-400">Base</div>
          <div className="text-sm text-blue-200">Network</div>
        </div>
      </div>

      {/* Hero NFT Preview */}
      <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30">
        <h3 className="text-xl font-bold text-white mb-4">
          🦸 HowToBase Hero NFT
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* NFT Preview */}
          <div className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-xl p-6 border border-yellow-400/30">
            <div className="text-center">
              <div className="text-8xl mb-4">🦸</div>
              <h4 className="text-xl font-bold text-white mb-2">
                {heroNFTMetadata.name}
              </h4>
              <p className="text-blue-200 text-sm mb-4">
                {heroNFTMetadata.description}
              </p>
              
              {/* Attributes */}
              <div className="space-y-2">
                {heroNFTMetadata.attributes.map((attr, i) => (
                  <div key={i} className="flex justify-between text-xs bg-black/20 rounded p-2">
                    <span className="text-blue-300">{attr.trait_type}:</span>
                    <span className="text-white font-semibold">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Minting Interface */}
          <div className="space-y-4">
            <div className="bg-black/20 rounded-lg p-4">
              <h5 className="font-semibold text-white mb-2">Requirements:</h5>
              <ul className="space-y-1 text-sm text-blue-200">
                <li>✓ Connect Smart Wallet</li>
                <li>✓ Switch to Base Sepolia</li>
                <li>✓ Have 1 USDC for minting</li>
                <li>✓ Complete HowToBase Academy</li>
              </ul>
            </div>

            {isConnected ? (
              <div className="space-y-4">
                <button
                  onClick={mintHeroNFT}
                  disabled={isProcessing || isPending}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-all disabled:cursor-not-allowed"
                >
                  {isProcessing || isPending ? "🔄 Minting Hero NFT..." : "🦸 Mint Hero NFT (1 USDC)"}
                </button>

                {/* Mint Result */}
                {mintResult && (
                  <div className={`p-4 rounded-lg ${mintResult.success ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                    {mintResult.success ? (
                      <div>
                        <h4 className="font-semibold text-green-400 mb-2">🎉 Hero NFT Minted!</h4>
                        <p className="text-green-300 text-sm">
                          Your HowToBase Hero badge has been successfully created!
                        </p>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-semibold text-red-400 mb-2">❌ Minting Failed</h4>
                        <p className="text-red-300 text-sm">{mintResult.error}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔌</div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Connect Your Wallet
                </h4>
                <p className="text-blue-200">
                  Connect your Smart Wallet to mint your Hero NFT
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NFT Features */}
      <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30">
        <h3 className="text-xl font-bold text-white mb-4">
          🎨 Why Mint Hero NFTs?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nftFeatures.map((feature, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-black/20 border border-blue-500/20"
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{feature.icon}</span>
                <h4 className="font-semibold text-white">
                  {feature.title}
                </h4>
              </div>
              <p className="text-sm text-blue-200">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Minting Process */}
      <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30">
        <h3 className="text-xl font-bold text-white mb-4">
          🛠️ NFT Minting Process
        </h3>
        <div className="space-y-4">
          {mintingProcess.map((item) => (
            <div key={item.step} className="flex items-start space-x-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                item.status === 'completed' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-600 text-gray-300'
              }`}>
                {item.status === 'completed' ? '✓' : item.step}
              </div>
              <div>
                <h4 className="font-medium text-white">{item.title}</h4>
                <p className="text-sm text-blue-200">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Tips */}
      <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30">
        <h4 className="font-semibold text-white mb-3">
          💡 Hero NFT Pro Tips
        </h4>
        <ul className="space-y-2 text-sm text-blue-200">
          <li className="flex items-center space-x-2">
            <span className="text-green-400">✓</span>
            <span>Hero NFTs are permanent proof of your Base mastery</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-400">✓</span>
            <span>Each NFT is unique with your wallet address embedded</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-400">✓</span>
            <span>Built on Base L2 for fast and cheap transactions</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-400">✓</span>
            <span>Show off your Hero badge in your NFT collection</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default MintTutorial; 