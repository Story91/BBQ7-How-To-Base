import { NextRequest, NextResponse } from 'next/server';
import { getSpenderWalletClient, getPublicClient } from '@/lib/spender';
import { spendPermissionManagerAddress, spendPermissionManagerABI } from '@/lib/abi/SpendPermissionManager';
import { parseUnits } from 'viem';

export async function POST(request: NextRequest) {
  try {
    const { spendPermission, signature } = await request.json();

    if (!spendPermission || !signature) {
      return NextResponse.json(
        { error: 'Missing spendPermission or signature' },
        { status: 400 }
      );
    }

    // Get wallet clients
    const spenderWallet = await getSpenderWalletClient();
    const publicClient = await getPublicClient();

    // First, approve the spend permission on-chain (if not already done)
    try {
      const approveTx = await spenderWallet.writeContract({
        address: spendPermissionManagerAddress,
        abi: spendPermissionManagerABI,
        functionName: 'approve',
        args: [spendPermission, signature],
      });

      console.log('Approval transaction:', approveTx);

      // Wait for approval to be mined
      await publicClient.waitForTransactionReceipt({ hash: approveTx });
    } catch (error) {
      // If approval fails, it might already be approved
      console.log('Approval might already exist:', error);
    }

    // Now spend from the permission (collect subscription)
    const spendAmount = parseUnits("0.001", 18); // Collect 0.001 ETH

    const spendTx = await spenderWallet.writeContract({
      address: spendPermissionManagerAddress,
      abi: spendPermissionManagerABI,
      functionName: 'spend',
      args: [spendPermission, spendAmount],
      value: spendAmount,
    });

    console.log('Spend transaction:', spendTx);

    // Wait for spend transaction to be mined
    const receipt = await publicClient.waitForTransactionReceipt({ hash: spendTx });

    return NextResponse.json({
      success: true,
      transactionHash: spendTx,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
    });

  } catch (error) {
    console.error('Error collecting subscription:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to collect subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 