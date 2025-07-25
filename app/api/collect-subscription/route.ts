import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { spendPermissionManagerAddress, spendPermissionManagerABI } from "@/lib/abi/SpendPermissionManager";

// API endpoint to collect subscription payment using spend permission
export async function POST(request: NextRequest) {
  try {
    const { spendPermission, signature, amount } = await request.json();

    if (!spendPermission || !signature || !amount) {
      return NextResponse.json(
        { error: "Missing required parameters: spendPermission, signature, or amount" },
        { status: 400 }
      );
    }

    // Create wallet client using spender private key
    const spenderPrivateKey = process.env.SPENDER_PRIVATE_KEY;
    if (!spenderPrivateKey) {
      return NextResponse.json(
        { error: "Spender private key not configured" },
        { status: 500 }
      );
    }

    const account = privateKeyToAccount(spenderPrivateKey as `0x${string}`);
    
    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(),
    });

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    // Execute spend using the spend permission
    const hash = await walletClient.writeContract({
      address: spendPermissionManagerAddress,
      abi: spendPermissionManagerABI,
      functionName: "spend",
      args: [
        spendPermission,
        BigInt(amount), // Amount to spend (in USDC wei, 6 decimals)
      ],
    });

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return NextResponse.json({
      success: true,
      transactionHash: hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
      amountCollected: amount,
      message: "Subscription payment collected successfully"
    });

  } catch (error) {
    console.error("Error collecting subscription:", error);
    return NextResponse.json(
      { 
        error: "Failed to collect subscription payment", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
} 