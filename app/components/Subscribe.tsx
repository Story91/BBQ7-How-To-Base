"use client";
import { cn, color, pressable, text } from "@coinbase/onchainkit/theme";
import { useEffect, useState } from "react";
import {
  useAccount,
  useChainId,
  useConnect,
  useConnectors,
} from "wagmi";
import { useSendCalls } from "wagmi/experimental";
import { Address, Hex, parseUnits, encodeFunctionData, erc20Abi } from "viem";
import { useNotification } from "@coinbase/onchainkit/minikit";
import { baseSepolia } from "viem/chains";

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
  const [isDisabled, setIsDisabled] = useState(false);
  const [transactions, setTransactions] = useState<Hex[]>([]);
  const [result, setResult] = useState<SubscriptionResult | null>(null);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [dataToRequest, setDataToRequest] = useState<DataRequest>({
    email: true,
    name: true,
    physicalAddress: true,
    phoneNumber: false
  });

  const sendNotification = useNotification();
  const account = useAccount();
  const chainId = useChainId();
  const { connectAsync } = useConnect();
  const connectors = useConnectors();

  // Use Smart Wallet Profiles with useSendCalls
  const { sendCalls, data, error, isPending } = useSendCalls();

  // Function to get callback URL (for production use ngrok or deployed URL)
  function getCallbackURL() {
    // For development: install ngrok and run: ngrok http 3000
    // Then set NEXT_PUBLIC_CALLBACK_URL="https://your-ngrok-url.ngrok-free.app"
    
    const callbackUrl = process.env.NEXT_PUBLIC_CALLBACK_URL;
    
    if (callbackUrl) {
      return `${callbackUrl}/api/data-validation`;
    }
    
    // For production
    if (process.env.NODE_ENV === 'production') {
      return "https://your-domain.com/api/data-validation";
    }
    
    // WARNING: localhost won't work with Coinbase Wallet API
    console.warn('⚠️ Using localhost callback URL - this will not work with Coinbase Wallet API. Set NEXT_PUBLIC_CALLBACK_URL in .env.local with your ngrok URL');
    return "http://localhost:3000/api/data-validation";
  }

  // Handle response data when sendCalls completes
  useEffect(() => {
    if (data) {
      console.log('Subscription transaction data received:', data);
      
      // Check if we have profile data in capabilities
      if (data.capabilities?.dataCallback) {
        console.log('📊 Processing Smart Wallet Profiles data...');
        const callbackData = data.capabilities.dataCallback;
        const newResult: SubscriptionResult = { success: true };

        // Extract email if provided
        if (callbackData.email) newResult.email = callbackData.email;

        // Extract name if provided  
        if (callbackData.name) newResult.name = callbackData.name;

        // Extract address if provided
        if (callbackData.physicalAddress) {
          const addr = callbackData.physicalAddress;
          newResult.address = [
            addr.address1,
            addr.address2,
            addr.city,
            addr.state,
            addr.postalCode,
            addr.countryCode
          ].filter(Boolean).join(", ");
        }

        // Extract phone if provided
        if (callbackData.phoneNumber) newResult.phoneNumber = callbackData.phoneNumber;

        setResult(newResult);
        
        sendNotification({
          title: "Smart Wallet Profiles Success! 🔐",
          body: "Profile data collected and subscription created!"
        });
      } else {
        console.log('💡 Simple subscription completed (no profile data)');
        
        // Create mock result for demo purposes in fallback mode
        const mockResult: SubscriptionResult = { 
          success: true,
          email: dataToRequest.email ? "✅ Demo: user@example.com" : undefined,
          name: dataToRequest.name ? "✅ Demo: John Doe" : undefined,
          address: dataToRequest.physicalAddress ? "✅ Demo: 123 Main St, City, State" : undefined,
          phoneNumber: dataToRequest.phoneNumber ? "✅ Demo: +1-555-0123" : undefined,
        };
        
        setResult(mockResult);
        
        sendNotification({
          title: "Subscription Created! ✅",
          body: "Payment sent successfully (demo mode)"
        });
      }
      
      // Add transaction hash
      const transactionHash = typeof data === 'string' ? data : 
                              (data as any)?.hash || 
                              (data as any)?.transactionHash || 
                              data.id ||
                              JSON.stringify(data).slice(0, 20);
      setTransactions(prev => [...prev, transactionHash as Hex]);
      
      setIsProcessing(false);
    }
  }, [data, sendNotification, dataToRequest]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error("Subscription error:", error);
      
      // Provide helpful guidance for common errors
      if (error.message?.includes('400') || error.message?.includes('Bad Request')) {
        console.log('');
        console.log('🔧 Smart Wallet Profiles Error - How to Fix:');
        console.log('1. Install ngrok: npm install -g ngrok');
        console.log('2. Run ngrok: ngrok http 3000');
        console.log('3. Copy HTTPS URL to .env.local: NEXT_PUBLIC_CALLBACK_URL=https://your-ngrok-url.ngrok-free.app');
        console.log('4. Restart the app');
        console.log('');
        console.log('💡 The app will work in demo mode with mock data even without ngrok!');
      }
      
      setResult({
        success: false,
        error: error.message?.includes('400') 
          ? "Smart Wallet Profiles callback failed - check console for setup instructions. App will work in demo mode!" 
          : error.message || "Subscription failed"
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

  async function handleSubmit() {
    if (!agreedToPrivacy) {
      setResult({ success: false, error: "Please agree to our Privacy Policy to continue" });
      return;
    }

    setIsDisabled(true);
    setIsProcessing(true);
    
    let accountAddress = account?.address;
    if (!accountAddress) {
      try {
        const requestAccounts = await connectAsync({
          connector: connectors[0],
        });
        accountAddress = requestAccounts.accounts[0];
      } catch {
        setIsDisabled(false);
        setIsProcessing(false);
        return;
      }
    }

    try {
      setResult(null);

      // Build requests array based on user selection
      const requests = [];
      if (dataToRequest.email) requests.push({ type: "email", optional: false });
      if (dataToRequest.name) requests.push({ type: "name", optional: false });
      if (dataToRequest.physicalAddress) requests.push({ type: "physicalAddress", optional: false });
      if (dataToRequest.phoneNumber) requests.push({ type: "phoneNumber", optional: true });

      if (requests.length === 0) {
        setResult({ success: false, error: "Select at least one data type" });
        setIsDisabled(false);
        setIsProcessing(false);
        return;
      }

      // Get callback URL and check if it's valid (HTTPS)
      const callbackUrl = getCallbackURL();
      const isValidCallback = callbackUrl.startsWith('https://') && !callbackUrl.includes('localhost');
      
      // Send subscription payment with optional Smart Wallet Profiles data collection
      const callsConfig: any = {
        calls: [
          {
            to: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC contract on Base Sepolia
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "transfer",
              args: [
                process.env.NEXT_PUBLIC_SPENDER_ADDRESS! as Address || "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // Spender address
                parseUnits("0.01", 6), // 0.01 USDC subscription fee
              ],
            }),
          },
        ],
        chainId: baseSepolia.id, // Base Sepolia
      };

      // Only add dataCallback if we have valid HTTPS callback URL
      if (isValidCallback && requests.length > 0) {
        console.log('🔗 Using Smart Wallet Profiles with callback:', callbackUrl);
        callsConfig.capabilities = {
          dataCallback: {
            requests: requests,
            callbackURL: callbackUrl,
          },
        };
      } else {
        console.log('💡 Fallback mode: Simple payment without profile data collection');
        console.log('To enable profile data collection: Set NEXT_PUBLIC_CALLBACK_URL with ngrok HTTPS URL');
      }

      sendCalls(callsConfig);

      setIsDisabled(false);
    } catch (error) {
      console.error("Error setting up subscription:", error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      });
      setIsDisabled(false);
      setIsProcessing(false);
    }
  }

  async function handleCollectSubscription() {
    // Simulate collecting from existing subscription
    try {
      const response = await fetch("/api/collect-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: "demo-subscription",
          amount: "0.01"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to collect subscription");
      }

      const data = await response.json();
      if (data.transactionHash) {
        setTransactions(prev => [...prev, data.transactionHash]);
        await sendNotification({
          title: "Subscription Collected! 💰",
          body: `Transaction: ${data.transactionHash.slice(0, 10)}...`
        });
      }
      return data;
    } catch (error) {
      console.error("Error collecting subscription:", error);
      return null;
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--app-card-border)]">
        <h3 className="text-xl font-bold text-[var(--app-foreground)] mb-4">
          🔐 Smart Wallet Subscription Demo
        </h3>
        
        <div className="space-y-4">
          {/* Status indicator */}
          <div className={`p-4 rounded-lg ${process.env.NEXT_PUBLIC_CALLBACK_URL ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900'}`}>
            <h4 className={`font-medium mb-2 ${process.env.NEXT_PUBLIC_CALLBACK_URL ? 'text-green-800 dark:text-green-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
              {process.env.NEXT_PUBLIC_CALLBACK_URL ? '🔗 Smart Wallet Profiles Mode' : '💡 Demo Mode'}
            </h4>
            <p className={`text-sm ${process.env.NEXT_PUBLIC_CALLBACK_URL ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
              {process.env.NEXT_PUBLIC_CALLBACK_URL 
                ? 'Real profile data collection enabled with callback URL'
                : 'Using mock data for demo (set NEXT_PUBLIC_CALLBACK_URL with ngrok for real data collection)'
              }
            </p>
          </div>

          <div className="p-4 bg-[var(--app-gray)] rounded-lg">
            <h4 className="font-medium text-[var(--app-foreground)] mb-2">
              📋 Subscription Details
            </h4>
            <ul className="text-sm text-[var(--app-foreground-muted)] space-y-1">
              <li>• Amount: 0.01 USDC</li>
              <li>• Type: One-time subscription setup</li>
              <li>• Network: Base Sepolia</li>
              <li>• Features: {process.env.NEXT_PUBLIC_CALLBACK_URL ? 'Real profile data collection' : 'Demo with mock data'} + payment</li>
            </ul>
          </div>

          {/* Data Collection Options */}
          <div className="p-4 bg-[var(--app-gray)] rounded-lg">
            <h4 className="font-medium text-[var(--app-foreground)] mb-3">
              📊 Data to Collect
            </h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={dataToRequest.email}
                  onChange={() => setDataToRequest(prev => ({ ...prev, email: !prev.email }))}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span className="text-[var(--app-foreground)]">📧 Email Address</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={dataToRequest.name}
                  onChange={() => setDataToRequest(prev => ({ ...prev, name: !prev.name }))}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span className="text-[var(--app-foreground)]">👤 Full Name</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={dataToRequest.physicalAddress}
                  onChange={() => setDataToRequest(prev => ({ ...prev, physicalAddress: !prev.physicalAddress }))}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span className="text-[var(--app-foreground)]">🏠 Physical Address</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={dataToRequest.phoneNumber}
                  onChange={() => setDataToRequest(prev => ({ ...prev, phoneNumber: !prev.phoneNumber }))}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span className="text-[var(--app-foreground)]">📱 Phone Number (optional)</span>
              </label>
            </div>
          </div>

          {/* Privacy Agreement */}
          <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={agreedToPrivacy}
                onChange={() => setAgreedToPrivacy(!agreedToPrivacy)}
                className="w-4 h-4 text-purple-600 rounded mt-1"
              />
              <span className="text-sm text-blue-800 dark:text-blue-200">
                I agree to share my selected profile data and understand this demo will collect my information through Smart Wallet Profiles technology.
              </span>
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isDisabled || isProcessing || isPending || !agreedToPrivacy}
            className={cn(
              pressable.default,
              "w-full p-4 rounded-lg font-medium transition-colors",
              (isDisabled || isProcessing || isPending || !agreedToPrivacy)
                ? "opacity-50 cursor-not-allowed"
                : "bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white"
            )}
          >
            {isProcessing || isPending ? "🔄 Processing..." : "🔐 Create Subscription (0.01 USDC)"}
          </button>

          {/* Results Display */}
          {result && (
            <div className={`p-4 rounded-lg ${result.success ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <h4 className={`font-medium mb-2 ${result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                {result.success ? "✅ Subscription Successful!" : "❌ Error"}
              </h4>
              {result.success ? (
                <div className="space-y-2 text-sm">
                  {result.email && (
                    <p className="text-green-700 dark:text-green-300">📧 Email: {result.email}</p>
                  )}
                  {result.name && (
                    <p className="text-green-700 dark:text-green-300">👤 Name: {result.name}</p>
                  )}
                  {result.address && (
                    <p className="text-green-700 dark:text-green-300">🏠 Address: {result.address}</p>
                  )}
                  {result.phoneNumber && (
                    <p className="text-green-700 dark:text-green-300">📱 Phone: {result.phoneNumber}</p>
                  )}
                  <p className="text-green-700 dark:text-green-300">💰 Payment sent successfully!</p>
                </div>
              ) : (
                <p className="text-red-700 dark:text-red-300 text-sm">{result.error}</p>
              )}
            </div>
          )}

          {/* Transaction History */}
          {transactions.length > 0 && (
            <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                💾 Transaction History
              </h4>
              <div className="space-y-1">
                {transactions.map((tx, index) => (
                  <p key={index} className="text-purple-700 dark:text-purple-300 text-sm font-mono">
                    {index + 1}. {typeof tx === 'string' ? tx.slice(0, 20) : 'Transaction'}...
                  </p>
                ))}
              </div>
              <button
                onClick={handleCollectSubscription}
                className="mt-3 w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                🔄 Simulate Collection
              </button>
            </div>
          )}

          {/* Important Notes */}
          <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              ℹ️ Demo Notes
            </h4>
            <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
              <li>• This uses Smart Wallet Profiles instead of Spend Permissions</li>
              <li>• Profile data is collected through dataCallback capabilities</li>
              <li>• Requires Base Sepolia network and Smart Wallet</li>
              <li>• Update callback URL for production use</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 