"use client";
import { cn, color, pressable, text } from "@coinbase/onchainkit/theme";
import { useEffect, useState } from "react";
import {
  useAccount,
  useChainId,
  useConnect,
  useConnectors,
  useSwitchChain,
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
  const [result, setResult] = useState<SubscriptionResult | null>(null);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedTransactions, setProcessedTransactions] = useState<Set<string>>(new Set());
  
  const [dataToRequest, setDataToRequest] = useState<DataRequest>({
    email: true,
    name: true,
    physicalAddress: true,
    phoneNumber: false
  });

  const sendNotification = useNotification();
  const { address, isConnected, chain } = useAccount();
  const { connectAsync } = useConnect();
  const connectors = useConnectors();
  const { switchChain } = useSwitchChain();

  // Use Smart Wallet Profiles with useSendCalls
  const { sendCalls, data, error, isPending } = useSendCalls();

  // Function to get callback URL
  function getCallbackURL() {
    const callbackUrl = process.env.NEXT_PUBLIC_CALLBACK_URL;
    
    if (callbackUrl) {
      return `${callbackUrl}/api/data-validation`;
    }
    
    if (process.env.NODE_ENV === 'production') {
      return "https://your-domain.com/api/data-validation";
    }
    
    console.warn('⚠️ Using localhost callback URL - this will not work with Coinbase Wallet API. Set NEXT_PUBLIC_CALLBACK_URL in .env.local with your ngrok URL');
    return "http://localhost:3000/api/data-validation";
  }

  // Handle response data when sendCalls completes
  useEffect(() => {
    if (data) {
      console.log('Subscription transaction data received:', data);
      
      // Create a unique transaction ID
      const transactionId = typeof data === 'string' ? data : JSON.stringify(data);
      
      // Check if we already processed this transaction
      if (processedTransactions.has(transactionId)) {
        console.log('Transaction already processed:', transactionId);
        return;
      }
      
      // Mark transaction as processed
      setProcessedTransactions(prev => new Set(prev).add(transactionId));
      
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
      
      setIsProcessing(false);
    }
  }, [data, sendNotification, dataToRequest, processedTransactions]);

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
    
    let accountAddress = address;
    if (!accountAddress) {
      try {
        const requestAccounts = await connectAsync({
          connector: connectors[0],
        });
        accountAddress = requestAccounts.accounts[0];
      } catch {
        setIsProcessing(false);
        setIsDisabled(false);
        return;
      }
    }

    try {
      setResult(null);

      // Check if we're on the right chain
      if (chain?.id !== baseSepolia.id) {
        try {
          await switchChain({ chainId: baseSepolia.id });
        } catch (switchError) {
          setResult({ 
            success: false, 
            error: "Please switch to Base Sepolia network to continue" 
          });
          setIsProcessing(false);
          setIsDisabled(false);
          return;
        }
      }

      // Build requests array based on user selection
      const requests = [];
      if (dataToRequest.email) requests.push({ type: "email", optional: false });
      if (dataToRequest.name) requests.push({ type: "name", optional: false });
      if (dataToRequest.physicalAddress) requests.push({ type: "physicalAddress", optional: false });
      if (dataToRequest.phoneNumber) requests.push({ type: "phoneNumber", optional: true });

      // Send subscription payment with profile data collection
      sendCalls({
        calls: [
          {
            to: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC contract on Base Sepolia
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "transfer",
              args: [
                "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // vitalik.eth
                parseUnits("0.10", 6), // 0.10 USDC for subscription
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
    
    setIsDisabled(false);
  }

  async function handleCollectSubscription() {
    try {
      const response = await fetch("/api/collect-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Collecting recurring subscription payment"
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Collection response:", data);
      
      sendNotification({
        title: "Subscription Collected! 💰",
        body: "Recurring payment processed successfully"
      });
      
    } catch (e) {
      console.error("Collection failed:", e);
      sendNotification({
        title: "Collection Failed ❌",
        body: "Unable to collect subscription payment"
      });
    }
  }

  return (
    <div className="p-4 bg-black/20 backdrop-blur-lg rounded-xl border border-blue-500/30">
      <h3 className="text-lg font-semibold text-white mb-4">
        🔐 Smart Wallet Spend Permissions
      </h3>
      
      {/* Data Collection Options */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-white mb-3">📋 Data to Collect:</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={dataToRequest.email}
              onChange={(e) => setDataToRequest(prev => ({ ...prev, email: e.target.checked }))}
              className="text-blue-600"
            />
            <span className="text-blue-200">📧 Email Address</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={dataToRequest.name}
              onChange={(e) => setDataToRequest(prev => ({ ...prev, name: e.target.checked }))}
              className="text-blue-600"
            />
            <span className="text-blue-200">👤 Full Name</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={dataToRequest.physicalAddress}
              onChange={(e) => setDataToRequest(prev => ({ ...prev, physicalAddress: e.target.checked }))}
              className="text-blue-600"
            />
            <span className="text-blue-200">🏠 Physical Address</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={dataToRequest.phoneNumber}
              onChange={(e) => setDataToRequest(prev => ({ ...prev, phoneNumber: e.target.checked }))}
              className="text-blue-600"
            />
            <span className="text-blue-200">📱 Phone Number (optional)</span>
          </label>
        </div>
      </div>

      {/* Privacy Agreement */}
      <div className="mb-6">
        <label className="flex items-start space-x-2">
          <input
            type="checkbox"
            checked={agreedToPrivacy}
            onChange={(e) => setAgreedToPrivacy(e.target.checked)}
            className="mt-1 text-blue-600"
          />
          <span className="text-sm text-blue-200">
            I agree to share my selected data using Smart Wallet Profiles for this subscription service.
          </span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleSubmit}
          disabled={isDisabled || isProcessing || !agreedToPrivacy}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-2 px-4 rounded-lg font-semibold transition-all disabled:cursor-not-allowed"
        >
          {isProcessing ? "🔄 Processing..." : "🔐 Create Spend Permission (0.10 USDC)"}
        </button>

        {result?.success && (
          <button
            onClick={handleCollectSubscription}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-4 rounded-lg font-semibold transition-all"
          >
            💰 Collect Subscription Payment
          </button>
        )}
      </div>

      {/* Results Display */}
      {result && (
        <div className={`mt-4 p-4 rounded-lg ${result.success ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
          {result.success ? (
            <div>
              <h4 className="font-semibold text-green-400 mb-2">
                ✅ Spend Permission Created!
              </h4>
              <div className="space-y-1 text-sm">
                {result.email && (
                  <p className="text-green-300">📧 Email: {result.email}</p>
                )}
                {result.name && (
                  <p className="text-green-300">👤 Name: {result.name}</p>
                )}
                {result.address && (
                  <p className="text-green-300">🏠 Address: {result.address}</p>
                )}
                {result.phoneNumber && (
                  <p className="text-green-300">📱 Phone: {result.phoneNumber}</p>
                )}
              </div>
            </div>
          ) : (
            <div>
              <h4 className="font-semibold text-red-400 mb-2">❌ Error</h4>
              <p className="text-red-300 text-sm">{result.error}</p>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
        <h5 className="font-semibold text-blue-300 mb-2">ℹ️ How it works:</h5>
        <ul className="text-xs text-blue-200 space-y-1">
          <li>• Smart Wallet Profiles collect user data securely</li>
          <li>• Spend permissions allow recurring payments</li>
          <li>• Data is only shared with your explicit consent</li>
          <li>• Payments are processed automatically on Base Sepolia</li>
        </ul>
      </div>
    </div>
  );
} 