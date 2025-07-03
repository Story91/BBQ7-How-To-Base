"use client";

import { useEffect, useState } from "react";
import { encodeFunctionData, erc20Abi, parseUnits } from "viem";
import { useConnect, useAccount, useSwitchChain } from "wagmi";
import { useSendCalls } from "wagmi/experimental";
import { baseSepolia } from "wagmi/chains";

interface DataRequest {
  email: boolean;
  name: boolean;
  physicalAddress: boolean;
  phoneNumber: boolean;
}

interface SubscriptionResult {
  success: boolean;
  email?: string;
  name?: string;
  address?: string;
  phoneNumber?: string;
  error?: string;
  transactionHash?: string;
}

export default function Subscribe() {
  const { address, isConnected, chain } = useAccount();
  const [dataToRequest, setDataToRequest] = useState<DataRequest>({
    email: true,
    name: true,
    physicalAddress: true,
    phoneNumber: false
  });
  const [result, setResult] = useState<SubscriptionResult | null>(null);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedTransactions, setProcessedTransactions] = useState<Set<string>>(new Set());

  const { sendCalls, data, error } = useSendCalls();
  const { connect, connectors } = useConnect();
  const { switchChain } = useSwitchChain();

  // Function to get callback URL
  function getCallbackURL() {
    return `${process.env.NEXT_PUBLIC_URL || "https://how-to-base.vercel.app"}/api/data-validation`;
  }

  // Handle response data when sendCalls completes
  useEffect(() => {
    if (data) {
      console.log('Subscription data received:', data);
      
      // Create a unique transaction ID
      const transactionId = typeof data === 'string' ? data : JSON.stringify(data);
      
      // Check if we already processed this transaction
      if (processedTransactions.has(transactionId)) {
        console.log('Transaction already processed:', transactionId);
        return;
      }
      
      // Mark transaction as processed
      setProcessedTransactions(prev => new Set(prev).add(transactionId));
      
      setResult({ 
        success: true,
        email: "🎉 Subscription successful!",
        address: "You now have spend permissions set up!",
        transactionHash: transactionId
      });
      
      setIsProcessing(false);
    }
  }, [data, processedTransactions]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.log('Subscription error:', error);
      setResult({
        success: false,
        error: error.message || "Subscription failed"
      });
      setIsProcessing(false);
    }
  }, [error]);

  // Add timeout for processing state
  useEffect(() => {
    if (isProcessing) {
      const timeout = setTimeout(() => {
        console.log('Subscription timeout - stopping processing state');
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

  // Handle subscription setup
  async function handleSubscribe() {
    if (!agreedToPrivacy) {
      setResult({ success: false, error: "Please agree to our Privacy Policy to continue" });
      return;
    }

    if (!address) {
      setResult({ success: false, error: "Please connect your wallet first" });
      return;
    }

    if (!dataToRequest.email || !dataToRequest.name) {
      setResult({ success: false, error: "Email and Name are required for spend permissions" });
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

      // Send subscription transaction with spend permission setup
      sendCalls({
        calls: [
          {
            to: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC contract on Base Sepolia
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "transfer",
              args: [
                "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // vitalik.eth
                parseUnits("1", 6), // 1 USDC for subscription
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

  // Reset state
  const resetSubscription = () => {
    setResult(null);
    setAgreedToPrivacy(false);
  };

  return (
    <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--app-foreground)] mb-2">
          💳 Spend Permissions Setup
        </h2>
        <p className="text-[var(--app-foreground-muted)]">
          Set up recurring payments like in Clicket with spend permissions
        </p>
      </div>

      {!result ? (
        <div className="space-y-6">
          {/* Connection Status */}
          {!isConnected ? (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-200 text-sm text-center">
                🔒 Connect your Smart Wallet to set up spend permissions
              </p>
              <button
                onClick={() => connect({ connector: connectors[0] })}
                className="w-full mt-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-semibold transition-all"
              >
                Connect Wallet
              </button>
            </div>
          ) : (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-200 text-sm text-center">
                ✅ Wallet connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
          )}

          {/* Data Collection Options */}
          {isConnected && (
            <div>
              <h3 className="text-lg font-semibold text-[var(--app-foreground)] mb-4">
                📋 Required Information
              </h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 bg-[var(--app-card-bg)]/50 rounded-lg border border-[var(--app-card-border)]/50">
                  <input
                    type="checkbox"
                    checked={dataToRequest.email}
                    onChange={(e) => setDataToRequest(prev => ({ ...prev, email: e.target.checked }))}
                    className="text-blue-600 rounded"
                  />
                  <span className="text-[var(--app-foreground)]">
                    <strong>📧 Email Address</strong> - Required for spend permission notifications
                  </span>
                </label>
                <label className="flex items-center space-x-3 p-3 bg-[var(--app-card-bg)]/50 rounded-lg border border-[var(--app-card-border)]/50">
                  <input
                    type="checkbox"
                    checked={dataToRequest.name}
                    onChange={(e) => setDataToRequest(prev => ({ ...prev, name: e.target.checked }))}
                    className="text-blue-600 rounded"
                  />
                  <span className="text-[var(--app-foreground)]">
                    <strong>👤 Full Name</strong> - Required for account verification
                  </span>
                </label>
                <label className="flex items-center space-x-3 p-3 bg-[var(--app-card-bg)]/50 rounded-lg border border-[var(--app-card-border)]/50">
                  <input
                    type="checkbox"
                    checked={dataToRequest.physicalAddress}
                    onChange={(e) => setDataToRequest(prev => ({ ...prev, physicalAddress: e.target.checked }))}
                    className="text-blue-600 rounded"
                  />
                  <span className="text-[var(--app-foreground)]">
                    <strong>🏠 Physical Address</strong> - For billing and compliance
                  </span>
                </label>
                <label className="flex items-center space-x-3 p-3 bg-[var(--app-card-bg)]/50 rounded-lg border border-[var(--app-card-border)]/50">
                  <input
                    type="checkbox"
                    checked={dataToRequest.phoneNumber}
                    onChange={(e) => setDataToRequest(prev => ({ ...prev, phoneNumber: e.target.checked }))}
                    className="text-blue-600 rounded"
                  />
                  <span className="text-[var(--app-foreground)]">
                    <strong>📱 Phone Number</strong> - Optional, for urgent notifications
                  </span>
                </label>
              </div>
              
              {(!dataToRequest.email || !dataToRequest.name) && (
                <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-200 text-sm">
                    ⚠️ Email and Name are required for spend permissions setup
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Privacy Agreement */}
          {isConnected && (
            <div>
              <label className="flex items-start space-x-3 p-4 bg-[var(--app-card-bg)]/50 rounded-lg border border-[var(--app-card-border)]/50">
                <input
                  type="checkbox"
                  checked={agreedToPrivacy}
                  onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                  className="mt-1 text-blue-600 rounded"
                />
                <span className="text-sm text-[var(--app-foreground-muted)]">
                  I agree to the Privacy Policy and consent to sharing my selected information 
                  for spend permissions setup. I understand this will allow recurring payments.
                </span>
              </label>
            </div>
          )}

          {/* Subscribe Button */}
          <button
            onClick={handleSubscribe}
            disabled={!isConnected || !agreedToPrivacy || isProcessing || (!dataToRequest.email || !dataToRequest.name)}
            className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-all disabled:cursor-not-allowed"
          >
            {!isConnected ? 'Connect Wallet First' : 
             (!dataToRequest.email || !dataToRequest.name) ? 'Select Required Information' :
             !agreedToPrivacy ? 'Accept Privacy Policy' :
             isProcessing ? 'Setting up Spend Permissions...' : 
             'Setup Spend Permissions (1 USDC)'}
          </button>
        </div>
      ) : (
        /* Results Display */
        <div className={`text-center p-6 rounded-lg ${
          result.success 
            ? 'bg-green-500/20 border border-green-500/30' 
            : 'bg-red-500/20 border border-red-500/30'
        }`}>
          {result.success ? (
            <div>
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-xl font-bold text-green-400 mb-2">
                Spend Permissions Setup Complete!
              </h3>
              <p className="text-green-200 mb-4">
                {result.email}
              </p>
              <p className="text-green-300 text-sm mb-4">
                {result.address}
              </p>
              <div className="bg-green-500/20 rounded-lg p-3 mb-4">
                <p className="text-green-200 text-sm">
                  ✅ You can now make recurring payments through the app
                </p>
                <p className="text-green-200 text-sm">
                  ✅ Your spend permissions are active on Base Sepolia
                </p>
              </div>
              <button
                onClick={resetSubscription}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all"
              >
                Setup Another Permission
              </button>
            </div>
          ) : (
            <div>
              <div className="text-4xl mb-3">❌</div>
              <h3 className="text-xl font-bold text-red-400 mb-2">
                Setup Failed
              </h3>
              <p className="text-red-200 mb-4">
                {result.error}
              </p>
              <button
                onClick={resetSubscription}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 