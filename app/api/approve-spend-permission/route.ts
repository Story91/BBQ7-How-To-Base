import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { spendPermissionManagerAddress, spendPermissionManagerABI } from "@/lib/abi/SpendPermissionManager";

// API endpoint to approve spend permission on-chain
export async function POST(request: NextRequest) {
  try {
    const { spendPermission, signature } = await request.json();

    if (!spendPermission || !signature) {
      return NextResponse.json(
        { error: "Missing spendPermission or signature" },
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

    // Approve the spend permission on-chain
    const hash = await walletClient.writeContract({
      address: spendPermissionManagerAddress,
      abi: spendPermissionManagerABI,
      functionName: "approve",
      args: [
        spendPermission,
        signature,
      ],
    });

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return NextResponse.json({
      success: true,
      transactionHash: hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
    });

  } catch (error) {
    console.error("Error approving spend permission:", error);
    return NextResponse.json(
      { 
        error: "Failed to approve spend permission", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
} 