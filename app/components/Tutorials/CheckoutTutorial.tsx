"use client";

import React, { useState, useEffect } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { useSendCalls } from 'wagmi/experimental';
import { encodeFunctionData, erc20Abi, parseUnits } from 'viem';
import { baseSepolia } from 'wagmi/chains';
import { useNotification } from '@coinbase/onchainkit/minikit';

interface DataRequest {
  email: boolean;
  name: boolean;
  physicalAddress: boolean;
  phoneNumber: boolean;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  category: string;
  features: string[];
  popular: boolean;
  usdcPrice: number; // Price in USDC (6 decimals)
}

interface PurchaseResult {
  success: boolean;
  error?: string;
  transactionHash?: string;
}

interface CheckoutTutorialProps {
  onAchievementUnlock?: (achievementId: string) => void;
  className?: string;
}

export function CheckoutTutorial({ onAchievementUnlock, className = "" }: CheckoutTutorialProps) {
  const { address, isConnected, chain } = useAccount();
  const sendNotification = useNotification();
  const { switchChain } = useSwitchChain();
  
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [purchaseCount, setPurchaseCount] = useState(0);
  const [cart, setCart] = useState<Product[]>([]);
  const [dataToRequest, setDataToRequest] = useState<DataRequest>({
    email: true,
    name: true,
    physicalAddress: true,
    phoneNumber: false
  });
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<PurchaseResult | null>(null);
  const [processedTransactions, setProcessedTransactions] = useState<Set<string>>(new Set());

  const { sendCalls, data, error } = useSendCalls();

  // Function to get callback URL
  function getCallbackURL() {
    return `${process.env.NEXT_PUBLIC_URL || "https://how-to-base.vercel.app"}/api/data-validation`;
  }

  // Handle response data when sendCalls completes
  useEffect(() => {
    if (data) {
      console.log('Purchase data received:', data);
      
      // Create a unique transaction ID
      const transactionId = typeof data === 'string' ? data : JSON.stringify(data);
      
      // Check if we already processed this transaction
      if (processedTransactions.has(transactionId)) {
        console.log('Transaction already processed:', transactionId);
        return;
      }
      
      // Mark transaction as processed
      setProcessedTransactions(prev => new Set(prev).add(transactionId));
      
      const newCount = purchaseCount + 1;
      setPurchaseCount(newCount);
      
      setResult({ 
        success: true,
        transactionHash: transactionId
      });
      
      if (newCount === 1 && onAchievementUnlock) {
        onAchievementUnlock('crypto_purchase');
        sendNotification({
          title: "First Purchase! 🛒",
          body: "You've made your first crypto purchase on Base!"
        });
      }
      
      // Clear cart after successful purchase
      setCart([]);
      setIsProcessing(false);
    }
  }, [data, processedTransactions, purchaseCount, onAchievementUnlock, sendNotification]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.log('Purchase error:', error);
      setResult({
        success: false,
        error: error.message || "Purchase failed"
      });
      setIsProcessing(false);
    }
  }, [error]);

  // Add timeout for processing state
  useEffect(() => {
    if (isProcessing) {
      const timeout = setTimeout(() => {
        console.log('Purchase timeout - stopping processing state');
        setIsProcessing(false);
        if (!result) {
          setResult({
            success: false,
            error: "Transaction timed out. Please try again."
          });
        }
      }, 30000); // 30 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isProcessing, result]);

  const tutorialSteps = [
    {
      title: "Welcome to Crypto Commerce! 🛒",
      content: "Learn how to buy digital goods using cryptocurrency with spend permissions. Experience seamless crypto payments!",
      action: "Connect your wallet and browse products"
    },
    {
      title: "Smart Wallet Commerce 💳",
      content: "Using spend permissions and sub accounts, you can set up secure recurring payments and manage your crypto spending.",
      action: "Add products to cart and set up data permissions"
    },
    {
      title: "Complete Your Purchase! 🚀",
      content: "Make real crypto purchases on Base Sepolia. All transactions are sponsored and your data is securely handled.",
      action: "Review cart and complete payment"
    },
    {
      title: "Commerce Master! 🎉",
      content: "Congratulations! You've mastered crypto commerce with spend permissions. You can now make seamless crypto purchases!",
      action: "Explore more Base features"
    }
  ];
  
  const currentStep = tutorialSteps[tutorialStep];
  
  // Demo products - real prices in USDC
  const demoProducts: Product[] = [
    {
      id: 1,
      name: "Base Academy Premium",
      description: "Advanced tutorials and exclusive content",
      price: 0.01,
      currency: "ETH",
      usdcPrice: 5, // 5 USDC
      image: "🎓",
      category: "Education",
      features: [
        "Advanced DeFi tutorials",
        "NFT creation masterclass", 
        "1-on-1 mentorship",
        "Community access"
      ],
      popular: true
    },
    {
      id: 2,
      name: "Smart Wallet Pro",
      description: "Enhanced wallet features and spend permissions",
      price: 0.005,
      currency: "ETH", 
      usdcPrice: 3, // 3 USDC
      image: "🧠",
      category: "Tools",
      features: [
        "Advanced spend permissions",
        "Sub account management",
        "Custom transaction limits",
        "Priority support"
      ],
      popular: false
    },
    {
      id: 3,
      name: "Base Starter Pack",
      description: "Everything you need to start on Base",
      price: 0.002,
      currency: "ETH",
      usdcPrice: 1, // 1 USDC
      image: "🔵",
      category: "Starter",
      features: [
        "Base network guide",
        "Wallet setup tutorial",
        "First transaction help",
        "Community discord access"
      ],
      popular: false
    }
  ];

  const addToCart = (product: Product) => {
    if (!cart.find(item => item.id === product.id)) {
      setCart([...cart, product]);
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.usdcPrice, 0);

  // Handle checkout
  async function handleCheckout() {
    if (cart.length === 0) {
      setResult({ success: false, error: "Your cart is empty" });
      return;
    }

    if (!agreedToPrivacy) {
      setResult({ success: false, error: "Please agree to our Privacy Policy to continue" });
      return;
    }

    if (!address) {
      setResult({ success: false, error: "Please connect your wallet first" });
      return;
    }

    if (!dataToRequest.email || !dataToRequest.name) {
      setResult({ success: false, error: "Email and Name are required for purchases" });
      return;
    }

    try {
      setResult(null);
      setIsProcessing(true);

      // Check if we're on the right chain
             if (chain?.id !== baseSepolia.id) {
         try {
           await switchChain({ chainId: baseSepolia.id });
         } catch {
           setResult({ 
             success: false, 
             error: "Please switch to Base Sepolia network to continue" 
           });
           setIsProcessing(false);
           return;
         }
       }

      // Build requests array based on user selection
      const requests = [];
      if (dataToRequest.email) requests.push({ type: "email", optional: false });
      if (dataToRequest.name) requests.push({ type: "name", optional: false });
      if (dataToRequest.physicalAddress) requests.push({ type: "physicalAddress", optional: false });
      if (dataToRequest.phoneNumber) requests.push({ type: "phoneNumber", optional: true });

      // Send purchase transaction
      sendCalls({
        calls: [
          {
            to: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC contract on Base Sepolia
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "transfer",
              args: [
                "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // vitalik.eth (shop owner)
                parseUnits(totalPrice.toString(), 6), // Total USDC for all products
              ],
            }),
          },
        ],
        chainId: 84532, // Base Sepolia
        capabilities: {
          dataCallback: {
            requests: requests,
            callbackURL: getCallbackURL(),
          },
        },
      });
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error occurred"
      });
      setIsProcessing(false);
    }
  }

  const resetPurchase = () => {
    setResult(null);
    setAgreedToPrivacy(false);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tutorial Progress */}
      {showTutorial && (
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[var(--app-foreground)]">
              Crypto Commerce Tutorial
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
          
          {/* Tutorial Navigation */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-xs text-[var(--app-foreground-muted)]">
              Step {tutorialStep + 1} of {tutorialSteps.length}
            </div>
            <div className="flex space-x-2">
              {tutorialStep > 0 && (
                <button
                  onClick={() => setTutorialStep(prev => prev - 1)}
                  className="px-3 py-1 text-xs bg-[var(--app-gray)] hover:bg-[var(--app-gray)]/80 text-[var(--app-foreground-muted)] rounded-lg transition-colors"
                >
                  ← Back
                </button>
              )}
              {tutorialStep < tutorialSteps.length - 1 && purchaseCount > 0 && (
                <button
                  onClick={() => setTutorialStep(prev => prev + 1)}
                  className="px-3 py-1 text-xs bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white rounded-lg transition-colors"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-4 border border-[var(--app-card-border)]">
          <div className="text-2xl font-bold text-[var(--app-accent)]">{purchaseCount}</div>
          <div className="text-sm text-[var(--app-foreground-muted)]">Purchases</div>
        </div>
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-4 border border-[var(--app-card-border)]">
          <div className="text-2xl font-bold text-[var(--app-accent)]">{cart.length}</div>
          <div className="text-sm text-[var(--app-foreground-muted)]">Items in Cart</div>
        </div>
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-4 border border-[var(--app-card-border)]">
          <div className="text-2xl font-bold text-[var(--app-accent)]">{totalPrice}</div>
          <div className="text-sm text-[var(--app-foreground-muted)]">USDC Total</div>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected ? (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">🔌</div>
          <h3 className="text-xl font-bold text-[var(--app-foreground)] mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-[var(--app-foreground-muted)]">
            Connect your Smart Wallet to start making crypto purchases
          </p>
        </div>
      ) : (
        <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
          <p className="text-green-200 text-sm text-center">
            ✅ Wallet connected: {address?.slice(0, 6)}...{address?.slice(-4)} | Base Sepolia Ready
          </p>
        </div>
      )}

      {/* Products */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <h3 className="text-xl font-bold text-[var(--app-foreground)] mb-4">
          🛍️ Base Digital Products
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {demoProducts.map((product) => (
            <div
              key={product.id}
              className={`p-4 bg-[var(--app-gray)] rounded-lg hover:bg-[var(--app-card-border)] transition-colors relative ${
                product.popular ? 'ring-2 ring-[var(--app-accent)]' : ''
              }`}
            >
              {product.popular && (
                <div className="absolute -top-2 -right-2 bg-[var(--app-accent)] text-white text-xs px-2 py-1 rounded-full">
                  Popular
                </div>
              )}
              
              <div className="text-center mb-3">
                <div className="text-6xl mb-2">{product.image}</div>
                <h4 className="font-semibold text-[var(--app-foreground)]">
                  {product.name}
                </h4>
                <p className="text-sm text-[var(--app-foreground-muted)] mb-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-lg font-bold text-[var(--app-accent)]">
                    {product.usdcPrice} USDC
                  </span>
                  <span className="text-xs bg-[var(--app-accent)] text-white px-2 py-1 rounded">
                    {product.category}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                {product.features.map((feature, i) => (
                  <div key={i} className="flex items-center space-x-2 text-xs">
                    <span className="text-green-500">✓</span>
                    <span className="text-[var(--app-foreground-muted)]">{feature}</span>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => addToCart(product)}
                disabled={cart.some(item => item.id === product.id) || !isConnected}
                className={`w-full px-4 py-2 rounded-lg transition-colors ${
                  !isConnected
                    ? 'bg-gray-500 text-white cursor-not-allowed'
                    : cart.some(item => item.id === product.id)
                    ? 'bg-green-500 text-white cursor-not-allowed'
                    : 'bg-[var(--app-accent)] text-white hover:bg-[var(--app-accent-hover)]'
                }`}
              >
                {!isConnected ? 'Connect Wallet' : 
                 cart.some(item => item.id === product.id) ? 'Added ✓' : 'Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Shopping Cart & Checkout */}
      {cart.length > 0 && isConnected && (
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
          <h3 className="text-xl font-bold text-[var(--app-foreground)] mb-4">
            🛒 Shopping Cart & Checkout
          </h3>
          
          {/* Cart Items */}
          <div className="space-y-3 mb-6">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-[var(--app-gray)] rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{item.image}</span>
                  <div>
                    <h4 className="font-medium text-[var(--app-foreground)]">{item.name}</h4>
                    <p className="text-sm text-[var(--app-foreground-muted)]">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-[var(--app-accent)]">
                    {item.usdcPrice} USDC
                  </span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Data Collection */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-[var(--app-foreground)] mb-3">
              📋 Purchase Information
            </h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-3 bg-[var(--app-gray)] rounded-lg">
                <input
                  type="checkbox"
                  checked={dataToRequest.email}
                  onChange={(e) => setDataToRequest(prev => ({ ...prev, email: e.target.checked }))}
                  className="text-blue-600 rounded"
                />
                <span className="text-[var(--app-foreground)]">
                  <strong>📧 Email Address</strong> - Required for digital product delivery
                </span>
              </label>
              <label className="flex items-center space-x-3 p-3 bg-[var(--app-gray)] rounded-lg">
                <input
                  type="checkbox"
                  checked={dataToRequest.name}
                  onChange={(e) => setDataToRequest(prev => ({ ...prev, name: e.target.checked }))}
                  className="text-blue-600 rounded"
                />
                <span className="text-[var(--app-foreground)]">
                  <strong>👤 Full Name</strong> - Required for purchase verification
                </span>
              </label>
              <label className="flex items-center space-x-3 p-3 bg-[var(--app-gray)] rounded-lg">
                <input
                  type="checkbox"
                  checked={dataToRequest.physicalAddress}
                  onChange={(e) => setDataToRequest(prev => ({ ...prev, physicalAddress: e.target.checked }))}
                  className="text-blue-600 rounded"
                />
                <span className="text-[var(--app-foreground)]">
                  <strong>🏠 Physical Address</strong> - For invoicing and tax purposes
                </span>
              </label>
              <label className="flex items-center space-x-3 p-3 bg-[var(--app-gray)] rounded-lg">
                <input
                  type="checkbox"
                  checked={dataToRequest.phoneNumber}
                  onChange={(e) => setDataToRequest(prev => ({ ...prev, phoneNumber: e.target.checked }))}
                  className="text-blue-600 rounded"
                />
                <span className="text-[var(--app-foreground)]">
                  <strong>📱 Phone Number</strong> - Optional, for urgent purchase updates
                </span>
              </label>
            </div>
            
            {(!dataToRequest.email || !dataToRequest.name) && (
              <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-200 text-sm">
                  ⚠️ Email and Name are required for digital product purchases
                </p>
              </div>
            )}
          </div>

          {/* Privacy Agreement */}
          <div className="mb-6">
            <label className="flex items-start space-x-3 p-4 bg-[var(--app-gray)] rounded-lg">
              <input
                type="checkbox"
                checked={agreedToPrivacy}
                onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                className="mt-1 text-blue-600 rounded"
              />
              <span className="text-sm text-[var(--app-foreground-muted)]">
                I agree to the Privacy Policy and consent to sharing my selected information 
                for purchase processing and product delivery. I understand this is a real crypto transaction.
              </span>
            </label>
          </div>
          
          {/* Total and Checkout */}
          <div className="border-t border-[var(--app-card-border)] pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold text-[var(--app-foreground)]">Total:</span>
              <span className="text-xl font-bold text-[var(--app-accent)]">
                {totalPrice} USDC
              </span>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={!agreedToPrivacy || isProcessing || (!dataToRequest.email || !dataToRequest.name)}
              className="w-full px-6 py-3 bg-[var(--app-accent)] text-white rounded-lg hover:bg-[var(--app-accent-hover)] transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed font-medium"
            >
              {(!dataToRequest.email || !dataToRequest.name) ? 'Select Required Information' :
               !agreedToPrivacy ? 'Accept Privacy Policy' :
               isProcessing ? 'Processing Purchase...' : 
               `Complete Purchase (${totalPrice} USDC)`}
            </button>
          </div>
        </div>
      )}

      {/* Purchase Result */}
      {result && (
        <div className={`p-6 rounded-xl ${
          result.success 
            ? 'bg-green-500/20 border border-green-500/30' 
            : 'bg-red-500/20 border border-red-500/30'
        }`}>
          {result.success ? (
            <div className="text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-xl font-bold text-green-400 mb-2">
                Purchase Successful!
              </h3>
              <p className="text-green-200 mb-4">
                Your crypto purchase has been completed successfully on Base!
              </p>
              <div className="bg-green-500/20 rounded-lg p-3 mb-4">
                <p className="text-green-200 text-sm">
                  ✅ Digital products will be delivered via email
                </p>
                <p className="text-green-200 text-sm">
                  ✅ Transaction recorded on Base Sepolia
                </p>
              </div>
              <button
                onClick={resetPurchase}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all"
              >
                Shop Again
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-3">❌</div>
              <h3 className="text-xl font-bold text-red-400 mb-2">
                Purchase Failed
              </h3>
              <p className="text-red-200 mb-4">
                {result.error}
              </p>
              <button
                onClick={resetPurchase}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Commerce Info */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <h4 className="font-semibold text-[var(--app-foreground)] mb-3">
          💡 Spend Permissions Commerce
        </h4>
        <ul className="space-y-2 text-sm text-[var(--app-foreground-muted)]">
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Real USDC transactions on Base Sepolia testnet</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Secure data collection with spend permissions</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>All transactions are sponsored by Paymaster</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Your data is collected safely via Smart Wallet Profiles</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default CheckoutTutorial; 