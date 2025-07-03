"use client";
import { cn, pressable } from "@coinbase/onchainkit/theme";
import { useState } from "react";
import {
  useAccount,
  useChainId,
  useConnect,
  useConnectors,
  useSignTypedData,
} from "wagmi";
import { Address, Hex, parseUnits } from "viem";
import { useQuery } from "@tanstack/react-query";
import { spendPermissionManagerAddress } from "@/lib/abi/SpendPermissionManager";
import { useNotification } from "@coinbase/onchainkit/minikit";

interface SpendPermission {
  account: Address;
  spender: Address;
  token: Address;
  allowance: bigint;
  period: number;
  start: number;
  end: number;
  salt: bigint;
  extraData: string;
}

export default function Subscribe() {
  const [isDisabled, setIsDisabled] = useState(false);
  const [signature, setSignature] = useState<Hex>();
  const [transactions, setTransactions] = useState<Hex[]>([]);
  const [spendPermission, setSpendPermission] = useState<SpendPermission>();

  const { signTypedDataAsync } = useSignTypedData();
  const account = useAccount();
  const chainId = useChainId();
  const { connectAsync } = useConnect();
  const connectors = useConnectors();
  const sendNotification = useNotification();

  const { error, isLoading, refetch } = useQuery({
    queryKey: ["collectSubscription"],
    queryFn: handleCollectSubscription,
    refetchOnWindowFocus: false,
    enabled: !!signature,
  });

  async function handleSubmit() {
    setIsDisabled(true);
    let accountAddress = account?.address;
    if (!accountAddress) {
      try {
        const requestAccounts = await connectAsync({
          connector: connectors[0],
        });
        accountAddress = requestAccounts.accounts[0];
      } catch {
        setIsDisabled(false);
        return;
      }
    }

    try {
      // Create spend permission object
      const spendPermissionData: SpendPermission = {
        account: accountAddress,
        spender: process.env.NEXT_PUBLIC_SPENDER_ADDRESS! as Address,
        token: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as Address, // USDC on Base Sepolia
        allowance: parseUnits("10", 6), // 10 USDC allowance
        period: 86400, // 24 hours in seconds
        start: Math.floor(Date.now() / 1000), // Current timestamp
        end: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days from now
        salt: BigInt(Math.floor(Math.random() * 1000000)), // Random salt
        extraData: "0x", // No extra data
      };

      setSpendPermission(spendPermissionData);

      // Define the EIP-712 domain and types for spend permissions
      const domain = {
        name: "SpendPermissionManager",
        version: "1",
        chainId: chainId,
        verifyingContract: spendPermissionManagerAddress,
      };

      const types = {
        SpendPermission: [
          { name: "account", type: "address" },
          { name: "spender", type: "address" },
          { name: "token", type: "address" },
          { name: "allowance", type: "uint256" },
          { name: "period", type: "uint48" },
          { name: "start", type: "uint48" },
          { name: "end", type: "uint48" },
          { name: "salt", type: "uint256" },
          { name: "extraData", type: "bytes" },
        ],
      };

      // Sign the spend permission
      const sig = await signTypedDataAsync({
        domain,
        types,
        primaryType: "SpendPermission",
        message: spendPermissionData as unknown as Record<string, unknown>,
      });

      setSignature(sig);

      // Approve the spend permission on-chain
      const response = await fetch("/api/approve-spend-permission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          spendPermission: spendPermissionData,
          signature: sig,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve spend permission");
      }

      const result = await response.json();
      if (result.transactionHash) {
        setTransactions(prev => [...prev, result.transactionHash]);
        
        await sendNotification({
          title: "Spend Permission Created! 🔐",
          body: `Transaction: ${result.transactionHash.slice(0, 10)}...`
        });
      }

    } catch (error) {
      console.error("Error creating spend permission:", error);
      await sendNotification({
        title: "Error Creating Permission ❌",
        body: error instanceof Error ? error.message : "Unknown error"
      });
    }

    setIsDisabled(false);
  }

  async function handleCollectSubscription() {
    if (!spendPermission || !signature) {
      throw new Error("No spend permission available");
    }

    const response = await fetch("/api/collect-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        spendPermission,
        signature,
        amount: parseUnits("1", 6).toString(), // 1 USDC
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to collect subscription");
    }

    const result = await response.json();
    if (result.transactionHash) {
      setTransactions(prev => [...prev, result.transactionHash]);
      
      await sendNotification({
        title: "Subscription Collected! 💰",
        body: `Transaction: ${result.transactionHash.slice(0, 10)}...`
      });
    }
    return result;
  }

  return (
    <div className="p-4 bg-black/20 backdrop-blur-lg rounded-xl border border-blue-500/30">
      <h3 className="text-lg font-semibold text-white mb-4">
        🔐 Smart Wallet Spend Permissions
      </h3>
      
      <div className="space-y-4">
        {/* Status indicator */}
        <div className={`p-4 rounded-lg ${signature ? 'bg-green-500/20 border border-green-500/30' : 'bg-blue-500/20 border border-blue-500/30'}`}>
          <h4 className={`font-medium mb-2 ${signature ? 'text-green-400' : 'text-blue-400'}`}>
            {signature ? '✅ Spend Permission Active' : '🔐 Ready to Create Permission'}
          </h4>
          <p className={`text-sm ${signature ? 'text-green-300' : 'text-blue-300'}`}>
            {signature 
              ? 'Your spend permission is active and ready for recurring payments'
              : 'Click below to create a spend permission for recurring payments'
            }
          </p>
        </div>

        {/* Permission Details */}
        <div className="p-4 bg-black/20 rounded-lg border border-blue-500/20">
          <h4 className="font-medium text-white mb-2">
            📋 Permission Details
          </h4>
          <ul className="text-sm text-blue-200 space-y-1">
            <li>• Token: USDC on Base Sepolia</li>
            <li>• Allowance: 10 USDC total</li>
            <li>• Period: 24 hours (daily limit reset)</li>
            <li>• Duration: 30 days</li>
            <li>• Fee per collection: 1 USDC</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSubmit}
            disabled={isDisabled || !!signature}
            className={cn(
              pressable.default,
              "w-full p-4 rounded-lg font-medium transition-colors",
              (isDisabled || !!signature)
                ? "opacity-50 cursor-not-allowed bg-gray-600"
                : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            )}
          >
            {isDisabled ? "🔄 Creating Permission..." : signature ? "✅ Permission Created" : "🔐 Create Spend Permission"}
          </button>

          {signature && (
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className={cn(
                pressable.default,
                "w-full p-4 rounded-lg font-medium transition-colors",
                isLoading
                  ? "opacity-50 cursor-not-allowed bg-gray-600"
                  : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              )}
            >
              {isLoading ? "🔄 Collecting..." : "💰 Collect Subscription (1 USDC)"}
            </button>
          )}
        </div>

        {/* Transaction History */}
        {transactions.length > 0 && (
          <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/30">
            <h4 className="font-medium text-green-400 mb-2">
              💾 Transaction History
            </h4>
            <div className="space-y-1">
              {transactions.map((tx, index) => (
                <a
                  key={index}
                  href={`https://sepolia.basescan.org/tx/${tx}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-green-300 text-sm font-mono hover:text-green-100 transition-colors"
                >
                  {index + 1}. {tx.slice(0, 10)}...{tx.slice(-8)} ↗
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-500/20 rounded-lg border border-red-500/30">
            <h4 className="font-medium text-red-400 mb-2">❌ Error</h4>
            <p className="text-red-300 text-sm">
              {error instanceof Error ? error.message : "Unknown error occurred"}
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
          <h5 className="font-semibold text-blue-300 mb-2">ℹ️ How Spend Permissions Work:</h5>
          <ul className="text-xs text-blue-200 space-y-1">
            <li>• User signs a spend permission allowing recurring payments</li>
            <li>• Permission is approved on-chain via SpendPermissionManager</li>
            <li>• App can collect payments within the allowed limits</li>
            <li>• User maintains control and can revoke at any time</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 