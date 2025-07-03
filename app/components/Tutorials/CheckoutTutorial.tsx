"use client";

import React, { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useNotification } from '@coinbase/onchainkit/minikit';

interface CheckoutTutorialProps {
  onAchievementUnlock?: (achievementId: string) => void;
  className?: string;
}

export function CheckoutTutorial({ onAchievementUnlock, className = "" }: CheckoutTutorialProps) {
  const { address, isConnected } = useAccount();
  const sendNotification = useNotification();
  
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [purchaseCount, setPurchaseCount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [cart, setCart] = useState<any[]>([]);

  const handlePurchaseSuccess = useCallback(async () => {
    const newCount = purchaseCount + 1;
    setPurchaseCount(newCount);
    
    if (newCount === 1 && onAchievementUnlock) {
      onAchievementUnlock('crypto_purchase');
      await sendNotification({
        title: "First Purchase! 🛒",
        body: "You've made your first crypto purchase on Base!"
      });
    }
    
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    }
  }, [purchaseCount, onAchievementUnlock, sendNotification, tutorialStep]);

  const tutorialSteps = [
    {
      title: "Welcome to Crypto Commerce! 🛒",
      content: "Learn how to buy digital goods and services using cryptocurrency on Base. Experience the future of e-commerce!",
      action: "Connect your wallet to get started"
    },
    {
      title: "Understanding Crypto Payments 💳",
      content: "Crypto payments are fast, secure, and global. No need for traditional credit cards or bank transfers - just your wallet!",
      action: "Explore payment options"
    },
    {
      title: "Make Your First Purchase! 🚀",
      content: "Choose from our demo products and complete your first crypto purchase. All payments are instant and secure.",
      action: "Select and buy a product"
    },
    {
      title: "Commerce Master! 🎉",
      content: "Congratulations! You've completed your first crypto purchase. Welcome to the future of commerce!",
      action: "Explore more Base features"
    }
  ];
  
  const currentStep = tutorialSteps[tutorialStep];
  
  // Demo products
  const demoProducts = [
    {
      id: 1,
      name: "Base Academy Premium",
      description: "Advanced tutorials and exclusive content",
      price: 0.01,
      currency: "ETH",
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
      description: "Enhanced wallet features and tools",
      price: 0.005,
      currency: "ETH",
      image: "🧠",
      category: "Tools",
      features: [
        "Advanced security features",
        "Multi-chain support",
        "Custom UI themes",
        "Priority support"
      ],
      popular: false
    },
    {
      id: 3,
      name: "DeFi Starter Pack",
      description: "Curated DeFi protocols and guides",
      price: 0.008,
      currency: "ETH",
      image: "🌾",
      category: "DeFi",
      features: [
        "Yield farming guides",
        "Risk assessment tools",
        "Protocol comparisons",
        "Strategy templates"
      ],
      popular: false
    }
  ];

  const paymentMethods = [
    {
      name: "ETH",
      symbol: "ETH",
      icon: "💎",
      network: "Base",
      fast: true,
      cheap: true
    },
    {
      name: "USDC",
      symbol: "USDC",
      icon: "💰",
      network: "Base",
      fast: true,
      cheap: true
    },
    {
      name: "Base Token",
      symbol: "BASE",
      icon: "🔵",
      network: "Base",
      fast: true,
      cheap: true
    }
  ];

  const checkoutSteps = [
    {
      step: 1,
      title: "Select Product",
      description: "Choose what you want to buy",
      status: selectedProduct ? "completed" : "current"
    },
    {
      step: 2,
      title: "Choose Payment",
      description: "Select your preferred cryptocurrency",
      status: selectedProduct ? "current" : "pending"
    },
    {
      step: 3,
      title: "Confirm Purchase",
      description: "Review and confirm your order",
      status: "pending"
    },
    {
      step: 4,
      title: "Complete Payment",
      description: "Transaction is processed on Base",
      status: "pending"
    }
  ];

  const commerceFeatures = [
    {
      title: "Instant Payments",
      description: "Transactions settle in seconds on Base L2",
      icon: "⚡",
      color: "bg-blue-100 dark:bg-blue-900"
    },
    {
      title: "Low Fees",
      description: "Minimal transaction costs compared to traditional payments",
      icon: "💰",
      color: "bg-green-100 dark:bg-green-900"
    },
    {
      title: "Global Access",
      description: "Accept payments from anywhere in the world",
      icon: "🌍",
      color: "bg-purple-100 dark:bg-purple-900"
    },
    {
      title: "No Chargebacks",
      description: "Irreversible transactions protect merchants",
      icon: "🛡️",
      color: "bg-orange-100 dark:bg-orange-900"
    }
  ];

  const addToCart = (product: any) => {
    setCart([...cart, product]);
    setSelectedProduct(product.id);
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
    if (selectedProduct === productId) {
      setSelectedProduct(null);
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

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
          
          <div className="text-xs text-[var(--app-foreground-muted)] mt-4">
            Step {tutorialStep + 1} of {tutorialSteps.length}
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
          <div className="text-2xl font-bold text-[var(--app-accent)]">{totalPrice.toFixed(3)}</div>
          <div className="text-sm text-[var(--app-foreground-muted)]">ETH Total</div>
        </div>
      </div>

      {/* Commerce Features */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <h3 className="text-xl font-bold text-[var(--app-foreground)] mb-4">
          🚀 Why Crypto Commerce?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commerceFeatures.map((feature, index) => (
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

      {/* Products */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <h3 className="text-xl font-bold text-[var(--app-foreground)] mb-4">
          🛍️ Demo Products
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
                    {product.price} {product.currency}
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
                disabled={cart.some(item => item.id === product.id)}
                className={`w-full px-4 py-2 rounded-lg transition-colors ${
                  cart.some(item => item.id === product.id)
                    ? 'bg-green-500 text-white cursor-not-allowed'
                    : 'bg-[var(--app-accent)] text-white hover:bg-[var(--app-accent-hover)]'
                }`}
              >
                {cart.some(item => item.id === product.id) ? 'Added ✓' : 'Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Shopping Cart */}
      {cart.length > 0 && (
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
          <h3 className="text-xl font-bold text-[var(--app-foreground)] mb-4">
            🛒 Shopping Cart
          </h3>
          
          <div className="space-y-3">
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
                    {item.price} {item.currency}
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
            
            <div className="border-t border-[var(--app-card-border)] pt-3">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-[var(--app-foreground)]">Total:</span>
                <span className="text-xl font-bold text-[var(--app-accent)]">
                  {totalPrice.toFixed(3)} ETH
                </span>
              </div>
              
              <button
                onClick={handlePurchaseSuccess}
                disabled={!isConnected}
                className="w-full px-6 py-3 bg-[var(--app-accent)] text-white rounded-lg hover:bg-[var(--app-accent-hover)] transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed font-medium"
              >
                {!isConnected ? 'Connect Wallet to Purchase' : 'Complete Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <h3 className="text-xl font-bold text-[var(--app-foreground)] mb-4">
          💳 Accepted Payment Methods
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paymentMethods.map((method, index) => (
            <div
              key={index}
              className="p-4 bg-[var(--app-gray)] rounded-lg hover:bg-[var(--app-card-border)] transition-colors"
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-3xl">{method.icon}</span>
                <div>
                  <h4 className="font-semibold text-[var(--app-foreground)]">
                    {method.name}
                  </h4>
                  <p className="text-sm text-[var(--app-foreground-muted)]">
                    {method.network}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                {method.fast && (
                  <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                    Fast
                  </span>
                )}
                {method.cheap && (
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                    Low Fees
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Process */}
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <h3 className="text-xl font-bold text-[var(--app-foreground)] mb-4">
          🛠️ Checkout Process
        </h3>
        <div className="space-y-4">
          {checkoutSteps.map((item) => (
            <div key={item.step} className="flex items-start space-x-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                item.status === 'completed' 
                  ? 'bg-green-500 text-white'
                  : item.status === 'current'
                  ? 'bg-[var(--app-accent)] text-white'
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
          💡 Crypto Commerce Pro Tips
        </h4>
        <ul className="space-y-2 text-sm text-[var(--app-foreground-muted)]">
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Always double-check the recipient address before sending</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Use stable coins like USDC for price stability</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Base L2 offers fast and cheap transactions</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Crypto payments are irreversible - be careful!</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default CheckoutTutorial; 